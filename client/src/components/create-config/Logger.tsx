import { useState, useEffect } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { filesystem, os } from '@neutralinojs/lib';
import { open_save_location } from '../../logic/file';
import Button from '../ui/Button';
import LoadingIndicator from '../ui/LoadingIndicator';
import Checkbox from '../ui/Checkbox';
import Icon from '../ui/Icon';
import { IoMdSettings } from 'react-icons/io';
import {
    update_config,
    type Config,
    type LogType,
    get_date,
    get_formatted_date,
    get_config,
    hexToString
} from './config';
import Select from './Select';
import { find_all_indicies } from '../../logic/util';
import { ModalManager } from '../modal/modal-store';
import ConfigModal from './ConfigModal';

export interface LoggerProps {
    logs: LogType[];
    height?: number;
    loading?: boolean;
}

export interface LoggerRowProps {
    logs: LogType[];
    possibleKillOffsets: number[];
    killIndex: number;
    playerOneIndex: number;
    playerTwoIndex: number;
    guildIndex: number;
    updateNames: (target: 'player_one' | 'player_two' | 'guild', value: number) => void;
    getNameOptions: (i: number, log: LogType) => string[];
}

function Logger({ logs, height = 155, loading = false }: LoggerProps) {
    const [possibleNameOffsets, setPossibleNameOffsets] = useState<{ offset: number; count: number }[][]>([]);
    const [nameIndicies, setNameIndicies] = useState<number[]>([0, 0, 0, 0, 0]);
    const [playerOneIndex, setPlayerOneIndex] = useState(0);
    const [playerTwoIndex, setPlayerTwoIndex] = useState(1);
    const [guildIndex, setGuildIndex] = useState(2);
    const [possibleKillOffsets, setPossibleKillOffsets] = useState<number[]>([]);
    const [killIndex, setKillIndex] = useState(0);
    const [config, setConfig] = useState<Config | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        (async () => {
            const cfg = await get_config();
            setConfig(cfg);
            setPossibleKillOffsets([cfg.kill]);
            setPossibleNameOffsets([
                [{ offset: cfg.player_one, count: 1 }],
                [{ offset: cfg.player_two, count: 1 }],
                [{ offset: cfg.guild, count: 1 }]
            ]);
            setAutoScroll(cfg.auto_scroll);
        })();
    }, []);

    useEffect(() => {
        if (config) {
            update_config({ ...config, auto_scroll: autoScroll });
        }
    }, [autoScroll, config]);

    useEffect(() => {
        if (logs.length > 0) {
            logsChanged();
        }
    }, [logs]);

    function logsChanged() {
        if (autoScroll) {
            setTimeout(scroll);
        }

        if (logs.length < 50 || logs.length % 100 === 0) {
            const killOffsets = findKillOffset(logs);
            setPossibleKillOffsets(killOffsets);
            calculateConfig();
        }
    }

    async function calculateConfig() {
        let newPossibleNameOffsets = possibleNameOffsets.map((list) =>
            list.map((n) => ({ ...n, count: 0 }))
        );

        for (const log of logs) {
            for (let i = 0; i < log.names.length; i++) {
                const name = log.names[i];
                if (newPossibleNameOffsets[i]) {
                    const index = newPossibleNameOffsets[i].findIndex((n) => n.offset === name.offset);
                    if (index !== -1) {
                        newPossibleNameOffsets[i][index].count++;
                    } else {
                        newPossibleNameOffsets[i].push({ offset: name.offset, count: 1 });
                    }
                } else {
                    newPossibleNameOffsets[i] = [{ offset: name.offset, count: 1 }];
                }
            }
        }

        for (let i = 0; i < newPossibleNameOffsets.length; i++) {
            newPossibleNameOffsets[i] = newPossibleNameOffsets[i].sort((a, b) => b.count - a.count);
        }

        const identifiers = new Map<string, number>();
        for (const log of logs) {
            identifiers.set(log.identifier, (identifiers.get(log.identifier) || 0) + 1);
        }

        const identifier = Array.from(identifiers.entries())
            .sort((a, b) => b[1] - a[1])
            .map((a) => a[0])[0];

        setPossibleNameOffsets(newPossibleNameOffsets);
        await updateConfigWrapper(identifier);
    }

    async function updateConfigWrapper(identifier?: string) {
        if (!config) return;

        const newConfig = {
            ...config,
            patch: get_date(),
            identifier: identifier || config.identifier,
            player_one: possibleNameOffsets[playerOneIndex]?.[nameIndicies[playerOneIndex]]?.offset || 0,
            player_two: possibleNameOffsets[playerTwoIndex]?.[nameIndicies[playerTwoIndex]]?.offset || 0,
            guild: possibleNameOffsets[guildIndex]?.[nameIndicies[guildIndex]]?.offset || 0,
            kill: possibleKillOffsets[killIndex]
        };

        const updated = await update_config(newConfig);
        setConfig(updated);
    }

    function findKillOffset(logs: LogType[]) {
        const allIndicies: number[] = [];
        for (const log of logs) {
            let indicies = find_all_indicies(log.hex, '01');
            indicies = indicies.filter((index) =>
                log.names.every((n) => index > n.offset + 64 || index < n.offset)
            );
            allIndicies.push(...indicies);
        }

        const possibleKillOffsetsMap = new Map<number, number>();
        for (const log of logs) {
            for (const index of allIndicies) {
                if (log.hex.slice(index, index + 2) === '00') {
                    possibleKillOffsetsMap.set(index, (possibleKillOffsetsMap.get(index) || 0) + 1);
                }
            }
        }

        const sorted = Array.from(possibleKillOffsetsMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map((a) => a[0] + 1);

        return sorted;
    }

    function getName(i: number, log: LogType) {
        const list = possibleNameOffsets[i];
        if (!list) return '';
        const selected = nameIndicies[i];
        return hexToString(log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64))
            .replaceAll('\0', '')
            .replaceAll(' ', '');
    }

    function getNameOptions(i: number, log: LogType) {
        return possibleNameOffsets.map((list, index) => {
            const selected = nameIndicies[index];
            return hexToString(log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64))
                .replaceAll('\0', '')
                .replaceAll(' ', '');
        });
    }

    function updateNames(target: 'player_one' | 'player_two' | 'guild', value: number) {
        if (target === 'player_one') {
            if (value === playerTwoIndex) setPlayerTwoIndex(playerOneIndex);
            else if (value === guildIndex) setGuildIndex(playerOneIndex);
            setPlayerOneIndex(value);
        } else if (target === 'player_two') {
            if (value === playerOneIndex) setPlayerOneIndex(playerTwoIndex);
            else if (value === guildIndex) setGuildIndex(playerTwoIndex);
            setPlayerTwoIndex(value);
        } else if (target === 'guild') {
            if (value === playerOneIndex) setPlayerOneIndex(guildIndex);
            else if (value === playerTwoIndex) setPlayerTwoIndex(guildIndex);
            setGuildIndex(value);
        }
    }

    function scroll() {
        const container = document.querySelector('.react-window-list');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function getLogsString() {
        const currentUtcHour = new Date().getUTCHours();
        const useWorFormat = currentUtcHour < 18;

        let output = '';
        for (const log of logs) {
            let characters = '';
            const playerOneName = getName(playerOneIndex, log);
            const playerTwoName = getName(playerTwoIndex, log);
            const guildName = getName(guildIndex, log);

            if (config?.include_characters) {
                const remainingIndicies = [0, 1, 2, 3, 4].filter(
                    (i) => i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex
                );
                const remainingNames = remainingIndicies.map((i) => getName(i, log));
                characters = ` (${remainingNames.join(',')})`;
            }

            const isKill = log.hex[possibleKillOffsets[killIndex]] === '1';

            if (useWorFormat) {
                if (isKill) {
                    output += `[${log.time}] ${playerOneName} killed ${playerTwoName} from the ${guildName}${characters}\n`;
                } else {
                    output += `[${log.time}] ${playerOneName} was slain by ${playerTwoName} of the ${guildName}${characters}\n`;
                }
            } else {
                if (isKill) {
                    output += `[${log.time}] ${playerOneName} has killed ${playerTwoName} from ${guildName}${characters}\n`;
                } else {
                    output += `[${log.time}] ${playerOneName} died to ${playerTwoName} from ${guildName}${characters}\n`;
                }
            }
        }
        return output;
    }

    async function saveLogs() {
        const path = await open_save_location(get_formatted_date(get_date()) + '.log');
        await filesystem.writeFile(path, getLogsString());
    }

    const disabled = logs.length === 0 || loading;

    return (
        <>
            {logs.length > 0 && (
                <span className="absolute top-2 left-0 right-0 text-center text-gray-400 text-xs">
                    Adjust the Logs to: <b>FamilyName-1</b> kills/died to <b>FamilyName-2</b> from <b>Guild</b>
                </span>
            )}
            <div className="flex flex-col gap-2 items-center w-full relative">
                <div className="flex gap-1 items-center justify-start w-full px-1">
                    {logs.length} Logs
                    <div className="ml-2">
                        <Checkbox checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
                        <span>Auto scroll</span>
                    </div>
                    <button
                        className="ml-auto"
                        onClick={() =>
                            config && ModalManager.open(ConfigModal, {
                                config,
                                options: {
                                    possible_kill_offsets: possibleKillOffsets,
                                    possible_name_offsets: possibleNameOffsets,
                                    name_indicies: nameIndicies,
                                    player_one_index: playerOneIndex,
                                    player_two_index: playerTwoIndex,
                                    guild_index: guildIndex,
                                    kill_index: killIndex,
                                    include_characters: config.include_characters
                                },
                                onChange: async (options: any) => {
                                    setPossibleKillOffsets(options.possible_kill_offsets);
                                    setPossibleNameOffsets(options.possible_name_offsets);
                                    setNameIndicies(options.name_indicies);
                                    setPlayerOneIndex(options.player_one_index);
                                    setPlayerTwoIndex(options.player_two_index);
                                    setGuildIndex(options.guild_index);
                                    setKillIndex(options.kill_index);
                                    if (config) {
                                        config.include_characters = options.include_characters;
                                        await updateConfigWrapper();
                                    }
                                }
                            })
                        }
                    >
                        <Icon icon={IoMdSettings} className='cursor-pointer' />
                    </button>
                </div>
                <div className="w-full overflow-auto flex flex-col" style={{ height: `${height}px` }}>
                    {loading && logs.length === 0 ? (
                        <div className="absolute inset-0 flex justify-center items-center mb-14">
                            <LoadingIndicator />
                        </div>
                    ) : logs.length === 0 && !loading ? (
                        <p className="text-center text-gray-400">Waiting for logs...</p>
                    ) : (
                        <List
                            className="react-window-list"
                            rowComponent={LoggerRowComponent}
                            rowCount={logs.length}
                            rowHeight={40}
                            rowProps={{
                                logs,
                                possibleKillOffsets,
                                killIndex,
                                playerOneIndex,
                                playerTwoIndex,
                                guildIndex,
                                updateNames,
                                getNameOptions
                            }}
                        />
                    )}
                </div>
                <Button className="w-32" onClick={saveLogs} disabled={disabled}>
                    Save
                </Button>
            </div>
        </>
    );
}

function LoggerRowComponent({
    index,
    style,
    logs,
    possibleKillOffsets,
    killIndex,
    playerOneIndex,
    playerTwoIndex,
    guildIndex,
    updateNames,
    getNameOptions
}: RowComponentProps<LoggerRowProps>) {
    const log = logs[index];
    return (
        <div style={style} className="flex gap-2 group py-1 items-center px-1">
            <p className="text-sm text-gray-400">{log.time}</p>
            <Select
                options={getNameOptions(playerOneIndex, log)}
                selectedValue={playerOneIndex}
                onChange={(value) => updateNames('player_one', value)}
                className='w-28'
            />
            <div className="flex justify-center items-center w-16">
                {log.hex[possibleKillOffsets[killIndex]] === '1' ? (
                    <p className="self-center text-submarine-500">killed</p>
                ) : (
                    <p className="self-center text-red-400">died to</p>
                )}
            </div>
            <Select
                options={getNameOptions(playerTwoIndex, log)}
                selectedValue={playerTwoIndex}
                onChange={(value) => updateNames('player_two', value)}
                className='w-28'
            />
            <p className="text-sm text-gray-400">from</p>
            <Select
                options={getNameOptions(guildIndex, log)}
                selectedValue={guildIndex}
                onChange={(value) => updateNames('guild', value)}
                className='w-28'
            />
        </div>
    );
}

export default Logger;
import { useState } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { filesystem, os } from '@neutralinojs/lib';
import { open_save_location } from '../../logic/file';
import Button from '../ui/Button';
import LoadingIndicator from '../ui/LoadingIndicator';
import { get_date, get_formatted_date, type Log } from './config';
import Select from './Select';

interface LogEditorProps {
    logs: Log[];
    height?: number;
    loading?: boolean;
}

interface RowProps {
    logs: Log[];
    playerOneIndex: number;
    playerTwoIndex: number;
    guildIndex: number;
    updateNames: (target: 'player_one' | 'player_two' | 'guild', value: number) => void;
}

function LogEditor({ logs, height = 155, loading = false }: LogEditorProps) {
    const [playerOneIndex, setPlayerOneIndex] = useState(0);
    const [playerTwoIndex, setPlayerTwoIndex] = useState(1);
    const [guildIndex, setGuildIndex] = useState(2);

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

    function getLogsString() {
        const currentUtcHour = new Date().getUTCHours();
        const useNewFormat = currentUtcHour < 18;

        return logs
            .map((log) => {
                const remainingIndicies = [0, 1, 2, 3, 4].filter(
                    (i) => i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex
                );
                const remainingNames = remainingIndicies.map((i) => log.names[i]);
                const characters = ` (${remainingNames.join(',')})`;

                if (useNewFormat) {
                    return `[${log.time}] ${log.names[playerOneIndex]} ${log.kill ? 'killed' : 'was slain by'
                        } ${log.names[playerTwoIndex]} ${log.kill ? 'from the' : 'of the'
                        } ${log.names[guildIndex]}${characters}`;
                } else {
                    return `[${log.time}] ${log.names[playerOneIndex]} ${log.kill ? 'has killed' : 'died to'
                        } ${log.names[playerTwoIndex]} from ${log.names[guildIndex]}${characters}`;
                }
            })
            .join('\n');
    }

    async function saveLogs() {
        const path = await open_save_location(get_formatted_date(get_date()) + '.log');
        await filesystem.writeFile(path, getLogsString());
    }

    const disabled = logs.length === 0 || loading;

    return (
        <>
            {logs.length > 0 && (
                <span className="absolute top-2 left-0 right-0 text-center text-gray-400 text-sm">
                    Adjust the Logs to: <b>Family-Name-1</b> kills/died to <b>Family-Name-2</b> from <b>Guild</b>
                </span>
            )}
            <div className="flex flex-col gap-2 items-center w-full relative">
                <div className="flex gap-1 items-center justify-start w-full px-1">
                    {logs.length} Logs
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
                            rowComponent={RowComponent}
                            rowCount={logs.length}
                            rowHeight={40}
                            rowProps={{
                                logs,
                                playerOneIndex,
                                playerTwoIndex,
                                guildIndex,
                                updateNames
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

function RowComponent({
    index,
    style,
    logs,
    playerOneIndex,
    playerTwoIndex,
    guildIndex,
    updateNames
}: RowComponentProps<RowProps>) {
    const log = logs[index];
    return (
        <div style={style} className="flex gap-2 group py-1 items-center px-1">
            <p className="text-sm text-gray-400">{log.time}</p>
            <Select
                options={log.names}
                selectedValue={playerOneIndex}
                onChange={(value) => updateNames('player_one', value)}
            />
            <div className="flex justify-center items-center w-16">
                {log.kill ? (
                    <p className="self-center text-submarine-500">killed</p>
                ) : (
                    <p className="self-center text-red-500">died to</p>
                )}
            </div>
            <Select
                options={log.names}
                selectedValue={playerTwoIndex}
                onChange={(value) => updateNames('player_two', value)}
            />
            <p className="text-sm text-gray-400">from</p>
            <Select
                options={log.names}
                selectedValue={guildIndex}
                onChange={(value) => updateNames('guild', value)}
            />
        </div>
    );
}

export default LogEditor;
export type { RowProps };
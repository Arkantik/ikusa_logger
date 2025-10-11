import { filesystem, os } from '@neutralinojs/lib';
import { useState } from 'react';
import { LuSave, LuUpload, LuX } from 'react-icons/lu';
import { List, type RowComponentProps } from 'react-window';
import { open_save_location } from '../../logic/file';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import LoadingIndicator from '../ui/LoadingIndicator';
import { get_date, get_formatted_date, type Log } from './config';
import Select from './Select';

interface LogEditorProps {
    logs: Log[];
    height?: number;
    loading?: boolean;
    onDeleteLog?: (index: number) => void;
}

interface RowProps {
    logs: Log[];
    playerOneIndex: number;
    playerTwoIndex: number;
    guildIndex: number;
    updateNames: (target: 'player_one' | 'player_two' | 'guild', value: number) => void;
    onDeleteLog: (index: number) => void;
}

function LogEditor({ logs, height = 155, loading = false, onDeleteLog }: LogEditorProps) {
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

    function handleUploadToNodewar() {
        os.open('https://nodewar.gg/account');
    }

    const disabled = logs.length === 0 || loading;

    return (
        <div className="flex flex-col h-full w-full relative">
            {logs.length > 0 && (
                <div className="text-center text-gray-400 text-xs mb-2 px-2">
                    Adjust the Logs to: <span className="font-semibold text-gray-300">YourGuild-FamilyName</span> kills/died to <span className="font-semibold text-gray-300">Enemy-FamilyName</span> from <span className="font-semibold text-gray-300">Guild</span>
                </div>
            )}

            <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-sm font-medium text-white">{logs.length} Logs</span>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/20 mb-3">
                {loading && logs.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingIndicator />
                    </div>
                ) : logs.length === 0 && !loading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-400">Waiting for logs...</p>
                    </div>
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
                            updateNames,
                            onDeleteLog: (index: number) => onDeleteLog?.(index)
                        }}
                    />
                )}
            </div>

            <div className="flex gap-2 justify-center">
                <Button
                    className="w-full"
                    onClick={saveLogs}
                    disabled={disabled}
                    size="md"
                    color="primary"
                >
                    <Icon icon={LuSave} size="sm" className="mr-2" />
                    Save Logs
                </Button>
                <Button
                    className="w-full"
                    onClick={handleUploadToNodewar}
                    disabled={disabled}
                    size="md"
                    color="gradient"
                >
                    <Icon icon={LuUpload} size="sm" className="mr-2" />
                    Upload to NodewarGG
                </Button>
            </div>
        </div>
    );
}

function RowComponent({
    index,
    style,
    logs,
    playerOneIndex,
    playerTwoIndex,
    guildIndex,
    updateNames,
    onDeleteLog
}: RowComponentProps<RowProps>) {
    const log = logs[index];
    return (
        <div style={style} className="flex gap-2 items-center px-2 hover:bg-white/5 group">
            <span className="text-xs text-gray-500 w-16">{log.time}</span>
            <Select
                options={log.names}
                selectedValue={playerOneIndex}
                onChange={(value) => updateNames('player_one', value)}
                className='w-full max-w-32 text-xs'
            />
            <div className="flex justify-center items-center w-16">
                {log.kill ? (
                    <span className="text-xs font-medium text-green-400">killed</span>
                ) : (
                    <span className="text-xs font-medium text-red-400">died to</span>
                )}
            </div>
            <Select
                options={log.names}
                selectedValue={playerTwoIndex}
                onChange={(value) => updateNames('player_two', value)}
                className='w-full max-w-32 text-xs'
            />
            <span className="text-xs text-gray-500">from</span>
            <Select
                options={log.names}
                selectedValue={guildIndex}
                onChange={(value) => updateNames('guild', value)}
                className='w-full max-w-32 text-xs'
            />
            <button
                onClick={() => onDeleteLog(index)}
                className="cursor-pointer ml-auto p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-colors opacity-0 group-hover:opacity-100 hover:border-red-400/20"
                title="Delete entry"
            >
                <Icon icon={LuX} size="sm" />
            </button>
        </div>
    );
}

export default LogEditor;
export type { RowProps };

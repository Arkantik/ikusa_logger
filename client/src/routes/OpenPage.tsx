import { filesystem } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { LuFileText, LuFolder } from 'react-icons/lu';
import { get_config, type Log, type LogType } from '../components/create-config/config';
import LogEditor from '../components/create-config/LogEditor';
import Logger from '../components/create-config/Logger';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { open_file } from '../logic/file';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

const LOG_REGEX = /\[(.+)\] (\w+) (died to|has killed|killed|was slain by) (\w+) (?:from|of|from the) (?:the )?(\w+|-1)(?: \((\w+),(\w+)\))?/;

function OpenPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [combatLogs, setCombatLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [isNetwork, setIsNetwork] = useState(false);
    const [fileName, setFileName] = useState<string>('');
    const isDestroyedRef = useRef(false);

    useEffect(() => {
        return () => {
            isDestroyedRef.current = true;
        };
    }, []);

    const loggerCallback: LoggerCallback = (data, status) => {
        if (status === 'running') {
            const d = data.split(',');
            if (d.length === 8 && !data.includes('Network Interfaces:')) {
                const newLog: LogType = {
                    identifier: d[0],
                    time: d[1],
                    names: d.slice(2, 7).map((name) => {
                        const split = name.split(' ');
                        return { name: split[0], offset: +split[1] };
                    }),
                    hex: d[7]
                };

                setLogs((prevLogs) => {
                    const exists = prevLogs.find(
                        (log) =>
                            log.identifier === newLog.identifier &&
                            log.time === newLog.time &&
                            log.names.length === newLog.names.length &&
                            log.names.every((name, i) => name.name === newLog.names[i].name)
                    );

                    if (exists) return prevLogs;
                    return [...prevLogs, newLog];
                });
            }
        } else if (status === 'error') {
            console.error(data);
            setLoading(false);
        } else if (status === 'terminated') {
            setLoading(false);
        }
    };

    async function openPcap() {
        setLogs([]);
        setCombatLogs([]);
        setFileName('');

        const filePaths = await open_file();
        if (!filePaths || filePaths.length === 0) return;

        const filePath = filePaths[0];
        const config = await get_config();

        const pathParts = filePath.split(/[\\/]/);
        setFileName(pathParts[pathParts.length - 1]);

        if (filePath.includes('.txt') || filePath.includes('.log')) {
            setIsNetwork(false);
            const data = await filesystem.readFile(filePath);
            if (!data) return;

            const lines = data.split('\n');
            const newCombatLogs: Log[] = [];

            for (const line of lines) {
                const match = line.match(LOG_REGEX);
                if (match) {
                    const newCombatLog: Log = {
                        time: match[1],
                        names: [match[2], match[4], match[5], match[6] || '', match[7] || ''].filter(n => n),
                        kill: match[3] === 'has killed' || match[3] === 'killed'
                    };
                    newCombatLogs.push(newCombatLog);
                }
            }

            setCombatLogs(newCombatLogs);
        } else {
            setIsNetwork(true);
            setLoading(true);
            start_logger(
                loggerCallback,
                'analyze',
                '-f "' + filePath + '"' + (config.ip_filter ? ' -p' : '')
            );
        }
    }

    return (
        <div className="flex flex-col h-full w-full p-8 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                            <Icon icon={fileName ? LuFileText : LuFolder} size="lg" className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Selected File</div>
                            <div className="text-base font-semibold text-white">
                                {fileName || 'No file selected'}
                            </div>
                        </div>
                    </div>
                    <Button onClick={openPcap} size="md" color="gradient">
                        <Icon icon={LuFolder} size="sm" className="mr-2" />
                        Import File
                    </Button>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-2xl p-6 border border-white/10 overflow-hidden">
                {isNetwork ? (
                    <Logger logs={logs} height={window.innerHeight - 350} loading={loading} />
                ) : (
                    <LogEditor logs={combatLogs} height={window.innerHeight - 350} loading={loading} />
                )}
            </div>
        </div>
    );
}

export default OpenPage;
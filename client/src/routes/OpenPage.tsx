import { filesystem } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { get_config, type Log, type LogType } from '../components/create-config/config';
import LogEditor from '../components/create-config/LogEditor';
import Logger from '../components/create-config/Logger';
import Button from '../components/ui/Button';
import { open_file } from '../logic/file';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

const LOG_REGEX = /\[(.+)\] (\w+) (died to|has killed|killed|was slain by) (\w+) (?:from|of|from the) (?:the )?(\w+|-1)(?: \((\w+),(\w+)\))?/;

function OpenPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [combatLogs, setCombatLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [isNetwork, setIsNetwork] = useState(false);
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

        const filePaths = await open_file();
        if (!filePaths || filePaths.length === 0) return;

        const filePath = filePaths[0];
        const config = await get_config();

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
            console.log('Loaded combat logs:', newCombatLogs.length);
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
        <div className="flex flex-col items-center w-full gap-1">
            <Button className="mt-2 shrink-0" onClick={openPcap}>
                Import File
            </Button>
            {isNetwork ? (
                <Logger logs={logs} height={152} loading={loading} />
            ) : (
                <LogEditor logs={combatLogs} height={152} loading={loading} />
            )}
        </div>
    );
}

export default OpenPage;
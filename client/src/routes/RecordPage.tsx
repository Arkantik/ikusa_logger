import { useState, useEffect, useRef } from 'react';
import { get_config, type Config, type LogType } from '../components/create-config/config';
import Logger from '../components/create-config/Logger';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

function RecordPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const isDestroyedRef = useRef(false);
    const retryCountRef = useRef(0);
    const [config, setConfig] = useState<Config | null>(null);

    useEffect(() => {
        (async () => {
            const cfg = await get_config();
            setConfig(cfg);

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
                    } else if (data.includes('Error while reading network.')) {
                        alert('Error while reading network. Please notify me on Discord.');
                    }
                } else if (status === 'error') {
                    console.error(data);
                    alert(
                        'An error occured while trying to start the logger. Error message: ' +
                        data +
                        '\nLogger will be restarted.'
                    );
                    if (!isDestroyedRef.current && retryCountRef.current < 3) {
                        start_logger(
                            loggerCallback,
                            'analyze',
                            (cfg.all_interfaces ? '-i' : '') + (cfg.ip_filter ? ' -p' : '')
                        );
                        retryCountRef.current++;
                    } else if (!isDestroyedRef.current && retryCountRef.current >= 3) {
                        alert('Tried to start logger 3 times, but failed. Please try again.');
                    } else {
                        retryCountRef.current = 0;
                    }
                } else if (status === 'terminated') {
                    if (!isDestroyedRef.current && retryCountRef.current < 3) {
                        start_logger(
                            loggerCallback,
                            'analyze',
                            (cfg.all_interfaces ? '-i' : '') + (cfg.ip_filter ? ' -p' : '')
                        );
                        retryCountRef.current++;
                    } else if (!isDestroyedRef.current && retryCountRef.current >= 3) {
                        alert('Tried to start logger 3 times, but failed. Please try again.');
                    } else {
                        retryCountRef.current = 0;
                    }
                }
            };

            start_logger(
                loggerCallback,
                'analyze',
                (cfg.all_interfaces ? '-i' : '') + (cfg.ip_filter ? ' -p' : '')
            );
        })();

        return () => {
            isDestroyedRef.current = true;
        };
    }, []);

    return <Logger logs={logs} height={186} />;
}

export default RecordPage;
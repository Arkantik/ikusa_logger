import { useEffect, useMemo, useRef, useState } from 'react';
import { LuActivity, LuChartPie, LuSkull, LuSword } from 'react-icons/lu';
import { get_config, type Config, type LogType } from '../components/create-config/config';
import Logger from '../components/create-config/Logger';
import Icon from '../components/ui/Icon';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

function RecordPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const isDestroyedRef = useRef(false);
    const retryCountRef = useRef(0);
    const [config, setConfig] = useState<Config | null>(null);

    const stats = useMemo(() => {
        if (!config || logs.length === 0) {
            return { kills: 0, deaths: 0, kdr: 0 };
        }

        let kills = 0;
        let deaths = 0;

        logs.forEach(log => {
            const isKill = log.hex[config.kill] === '1';
            if (isKill) {
                kills++;
            } else {
                deaths++;
            }
        });

        const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;

        return { kills, deaths, kdr };
    }, [logs, config]);

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
                        'An error occurred while trying to start the logger. Error message: ' +
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

    return (
        <div className="flex flex-col h-full w-full p-8 gap-6">
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400 font-medium">Total Events</span>
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                            <Icon icon={LuActivity} size="sm" className="text-green-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{logs.length}</div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400 font-medium">Kills</span>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                            <Icon icon={LuSword} size="sm" className="text-blue-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{stats.kills}</div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400 font-medium">Deaths</span>
                        <div className="p-2 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-lg">
                            <Icon icon={LuSkull} size="sm" className="text-red-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-red-400">{stats.deaths}</div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400 font-medium">K/D Ratio</span>
                        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                            <Icon icon={LuChartPie} size="sm" className="text-purple-400" />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold ${stats.kdr >= 1 ? "text-green-400" : "text-red-400"} `}>{stats.kdr}</div>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-2xl p-6 border border-white/10 overflow-hidden">
                <Logger logs={logs} height={window.innerHeight - 400} />
            </div>
        </div>
    );
}

export default RecordPage;
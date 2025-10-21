import { useEffect, useRef, useState } from 'react';
import { LuActivity, LuChartPie, LuSkull, LuSword } from 'react-icons/lu';
import { get_config, type Config, type LogType } from '../components/create-config/config';
import Logger from '../components/create-config/Logger';
import KDTimeline from '../components/ui/KDTimeline';
import StatCard from '../components/ui/StatCard';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

function RecordPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const isDestroyedRef = useRef(false);
    const retryCountRef = useRef(0);
    const [config, setConfig] = useState<Config | null>(null);
    const [stats, setStats] = useState({ kills: 0, deaths: 0, kdr: 0 });

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

    const handleDeleteLog = (index: number) => {
        setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full w-full p-8 gap-4">
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Events"
                    value={logs.length}
                    icon={LuActivity}
                    iconColor="text-green-400"
                    gradientFrom="from-green-500/20"
                    gradientTo="to-emerald-500/20"
                />

                <StatCard
                    label="Kills"
                    value={stats.kills}
                    icon={LuSword}
                    iconColor="text-blue-400"
                    gradientFrom="from-blue-500/20"
                    gradientTo="to-cyan-500/20"
                    valueColor="text-blue-400"
                />

                <StatCard
                    label="Deaths"
                    value={stats.deaths}
                    icon={LuSkull}
                    iconColor="text-red-400"
                    gradientFrom="from-red-500/20"
                    gradientTo="to-rose-500/20"
                    valueColor="text-red-400"
                />

                <StatCard
                    label="K/D Ratio"
                    value={stats.kdr}
                    icon={LuChartPie}
                    iconColor="text-purple-400"
                    gradientFrom="from-purple-500/20"
                    gradientTo="to-pink-500/20"
                    valueColor={stats.kdr >= 1 ? "text-green-400" : "text-red-400"}
                />
            </div>

            <KDTimeline kills={stats.kills} deaths={stats.deaths} kdr={stats.kdr} />

            <div className="flex-1 glass-card rounded-2xl p-4 border border-white/10 overflow-hidden">
                <Logger logs={logs} height={window.innerHeight - 400} onStatsUpdate={setStats} onDeleteLog={handleDeleteLog} />
            </div>
        </div>
    );
}

export default RecordPage;
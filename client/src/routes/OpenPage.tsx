import { filesystem } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { LuActivity, LuChartPie, LuFileText, LuFolder, LuSkull, LuSword } from 'react-icons/lu';
import { get_config, type Log, type LogType } from '../components/create-config/config';
import LogEditor from '../components/create-config/LogEditor';
import Logger from '../components/create-config/Logger';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import KDTimeline from '../components/ui/KDTimeline';
import StatCard from '../components/ui/StatCard';
import { open_file } from '../logic/file';
import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';

const LOG_REGEX = /\[(.+)\] (\w+) (died to|has killed|killed|was slain by) (\w+) (?:from|of|from the) (?:the )?(\w+|-1)(?: \((\w+),(\w+)\))?/;

function OpenPage() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [combatLogs, setCombatLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [isNetwork, setIsNetwork] = useState(false);
    const [fileName, setFileName] = useState<string>('');
    const [stats, setStats] = useState({ kills: 0, deaths: 0, kdr: 0 });
    const [timelineKey, setTimelineKey] = useState(0);
    const isDestroyedRef = useRef(false);

    useEffect(() => {
        return () => {
            isDestroyedRef.current = true;
        };
    }, []);

    useEffect(() => {
        if (!isNetwork && combatLogs.length > 0) {
            let kills = 0;
            let deaths = 0;

            combatLogs.forEach(log => {
                log.kill ? kills++ : deaths++;
            });

            const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
            setStats({ kills, deaths, kdr });
        }
    }, [combatLogs, isNetwork]);

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
        setStats({ kills: 0, deaths: 0, kdr: 0 });
        setTimelineKey(prev => prev + 1);

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

    const handleDeleteLog = (index: number) => {
        setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    };

    const handleDeleteCombatLog = (index: number) => {
        setCombatLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full w-full p-8 gap-4">
            <div className="glass-card rounded-2xl p-2 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                            <Icon icon={fileName ? LuFileText : LuFolder} size="sm" className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Selected File</div>
                            <div className="text-sm font-semibold text-white">
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

            {(logs.length > 0 || combatLogs.length > 0) && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <StatCard
                            label="Events"
                            value={isNetwork ? logs.length : combatLogs.length}
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

                    <KDTimeline
                        key={timelineKey}
                        kdr={stats.kdr}
                        totalEvents={isNetwork ? logs.length : combatLogs.length}
                        allLogs={isNetwork ? undefined : combatLogs}
                        currentLogs={isNetwork ? logs : undefined}
                    />
                </>
            )}

            <div className="flex-1 glass-card rounded-2xl p-4 border border-white/10 overflow-hidden">
                {isNetwork ? (
                    <Logger logs={logs} height={window.innerHeight - (logs.length > 0 ? 550 : 350)} loading={loading} onStatsUpdate={setStats} onDeleteLog={handleDeleteLog} />
                ) : (
                    <LogEditor logs={combatLogs} height={window.innerHeight - (combatLogs.length > 0 ? 550 : 350)} loading={loading} onDeleteLog={handleDeleteCombatLog} />
                )}
            </div>
        </div>
    );
}

export default OpenPage;
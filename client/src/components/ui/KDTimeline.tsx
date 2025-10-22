import { useEffect, useRef, useState } from 'react';
import { calculateMaxKDR, drawTimeline } from '../../logic/drawTimeline';
import type { Log, LogType } from '../create-config/config';

interface KDTimelineProps {
    kdr: number;
    totalEvents?: number;
    allLogs?: Log[];
    currentLogs?: LogType[];
    killOffset?: number | null;
}

interface DataPoint {
    timestamp: number;
    kdr: number;
    kills: number;
    deaths: number;
}

function KDTimeline({ kdr, totalEvents = 0, allLogs, currentLogs, killOffset }: KDTimelineProps) {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);

    const parseTimeToTimestamp = (timeStr: string): number => {
        const today = new Date();
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        today.setHours(hours, minutes, seconds, 0);
        return today.getTime();
    };

    useEffect(() => {
        if (!allLogs && !currentLogs && totalEvents === 0) {
            setDataPoints([]);
            isInitializedRef.current = false;
            return;
        }
    }, [allLogs, currentLogs, totalEvents]);

    useEffect(() => {
        if (allLogs && allLogs.length > 0 && !isInitializedRef.current) {
            const newDataPoints: DataPoint[] = [];
            let cumulativeKills = 0;
            let cumulativeDeaths = 0;

            allLogs.forEach((log) => {
                log.kill ? cumulativeKills++ : cumulativeDeaths++;

                const currentKdr = cumulativeDeaths > 0
                    ? parseFloat((cumulativeKills / cumulativeDeaths).toFixed(2))
                    : cumulativeKills;

                const timestamp = parseTimeToTimestamp(log.time);

                newDataPoints.push({
                    timestamp,
                    kdr: currentKdr,
                    kills: cumulativeKills,
                    deaths: cumulativeDeaths
                });
            });

            setDataPoints(newDataPoints);
            isInitializedRef.current = true;
        }
    }, [allLogs]);

    useEffect(() => {
        if (currentLogs && currentLogs.length > 0 && killOffset !== null && killOffset !== undefined) {
            const newDataPoints: DataPoint[] = [];
            let cumulativeKills = 0;
            let cumulativeDeaths = 0;

            currentLogs.forEach((log) => {
                const isKill = log.hex[killOffset] === '1';

                isKill ? cumulativeKills++ : cumulativeDeaths++;

                const currentKdr = cumulativeDeaths > 0
                    ? parseFloat((cumulativeKills / cumulativeDeaths).toFixed(2))
                    : cumulativeKills;

                const timestamp = parseTimeToTimestamp(log.time);

                newDataPoints.push({
                    timestamp,
                    kdr: currentKdr,
                    kills: cumulativeKills,
                    deaths: cumulativeDeaths
                });
            });

            setDataPoints(newDataPoints);
        }
    }, [currentLogs, killOffset]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [dataPoints]);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        drawTimeline({
            canvas: canvasRef.current,
            container: containerRef.current,
            dataPoints,
        });
    }, [dataPoints, kdr]);

    const maxKDR = calculateMaxKDR(dataPoints);

    const yAxisLabels = [0, 1, 2, 3, 4].map((i) => {
        const value = (maxKDR * (4 - i) / 4).toFixed(1);
        const isOne = value === '1.0';
        return { value, isOne };
    });

    return (
        <div className="glass-card rounded-2xl p-2 border border-white/10">
            <div className="ml-4 flex gap-1 items-center mb-1">
                <span className="flex items-center justify-center rounded-full w-3.5 aspect-square p-0.5">
                    <span className="rounded-full w-2 aspect-square bg-red-600 animate-pulse"></span>
                </span>
                <h3 className="text-[10px] text-gray-400">Live K/D Tracking</h3>
            </div>
            <div className="relative">
                <div className="absolute left-0 top-0 h-[100px] w-[30px] bg-gradient-to-r from-[#1c1c29] via-[#1c1c29] to-transparent pointer-events-none z-10 flex flex-col justify-between">
                    {yAxisLabels.map((label, index) => (
                        <div key={index} className={`text-[10px] font-semibold text-right pr-1 font-sans ${label.isOne ? 'text-white/70' : 'text-white/60'}`}>
                            {label.value}
                        </div>
                    ))}
                </div>

                <div ref={containerRef} className="overflow-x-auto scrollbar-thin">
                    <canvas ref={canvasRef} height={100} className="h-[100px]" />
                </div>
            </div>
        </div>
    );
}

export default KDTimeline;
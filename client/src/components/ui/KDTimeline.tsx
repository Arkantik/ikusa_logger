import { useEffect, useRef, useState } from 'react';
import { calculateMaxKDR, drawTimeline } from '../../logic/drawTimeline';
import type { Log } from '../create-config/config';

interface KDTimelineProps {
    kdr: number;
    kills: number;
    deaths: number;
    allLogs?: Log[];
}

interface DataPoint {
    timestamp: number;
    kdr: number;
    kills: number;
    deaths: number;
}

function KDTimeline({ kdr, kills, deaths, allLogs }: KDTimelineProps) {
    const dataPointsRef = useRef<DataPoint[]>([]);
    const [_, setRenderTrigger] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (allLogs && allLogs.length > 0) {
            const points: DataPoint[] = [];
            let killCount = 0;
            let deathCount = 0;

            allLogs.forEach((log) => {
                log.kill ? killCount++ : deathCount++;

                const calculatedKdr = deathCount > 0 ? parseFloat((killCount / deathCount).toFixed(2)) : killCount;

                const [hours, minutes, seconds] = log.time.split(':').map(Number);
                const now = new Date();
                now.setHours(hours, minutes, seconds, 0);

                points.push({
                    timestamp: now.getTime(),
                    kdr: calculatedKdr,
                    kills: killCount,
                    deaths: deathCount
                });
            });

            dataPointsRef.current = points;
            setRenderTrigger(prev => prev + 1);
        }
    }, [allLogs]);

    useEffect(() => {
        if (allLogs && allLogs.length > 0) return;

        if (kills === 0 && deaths === 0) {
            dataPointsRef.current = [];
            setRenderTrigger(prev => prev + 1);
            return;
        }

        const lastPoint = dataPointsRef.current[dataPointsRef.current.length - 1];
        if (lastPoint && lastPoint.kills === kills && lastPoint.deaths === deaths) return;

        const newPoint: DataPoint = {
            timestamp: Date.now(),
            kdr,
            kills,
            deaths
        };

        dataPointsRef.current = [...dataPointsRef.current, newPoint];
        setRenderTrigger(prev => prev + 1);
    }, [kdr, kills, deaths, allLogs]);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        drawTimeline({
            canvas: canvasRef.current,
            container: containerRef.current,
            dataPoints: dataPointsRef.current,
        });

        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }, [dataPointsRef.current.length, setRenderTrigger]);

    const maxKDR = calculateMaxKDR(dataPointsRef.current);

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
                <div className="absolute left-0 top-0 h-[100px] w-[30px] bg-linear-to-r from-[#1c1c29] via-[#1c1c29] to-transparent pointer-events-none z-10 flex flex-col justify-between">
                    {yAxisLabels.map((label, index) => (
                        <div
                            key={index}
                            className={`text-[10px] font-semibold text-right pr-1 font-sans ${label.isOne ? 'text-white/70' : 'text-white/60'}`}
                        >
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
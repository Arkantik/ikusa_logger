import { useEffect, useRef, useState } from 'react';

interface KDTimelineProps {
    kills: number;
    deaths: number;
    kdr: number;
}

interface DataPoint {
    timestamp: number;
    kdr: number;
    kills: number;
    deaths: number;
}

function KDTimeline({ kills, deaths, kdr }: KDTimelineProps) {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const now = Date.now();
        setDataPoints(prev => [...prev, { timestamp: now, kdr, kills, deaths }]);
    }, [kills, deaths, kdr]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dataPoints.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const xPadding = 25;
        const yPadding = 10;

        ctx.clearRect(0, 0, width, height);

        const dataMaxKDR = Math.max(...dataPoints.map(p => p.kdr));
        const maxKDR = Math.max(2, Math.ceil(dataMaxKDR * 2) / 2);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = yPadding + (height - 2 * yPadding) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(xPadding, y);
            ctx.lineTo(width - xPadding, y);
            ctx.stroke();
        }

        const oneKDRY = yPadding + (height - 2 * yPadding) * (1 - 1 / maxKDR);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xPadding, oneKDRY);
        ctx.lineTo(width - xPadding, oneKDRY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('1.0', xPadding - 8, oneKDRY + 4);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const value = (maxKDR * (4 - i) / 4).toFixed(1);
            const y = yPadding + (height - 2 * yPadding) * (i / 4);
            ctx.fillText(value, xPadding - 8, y + 4);
        }

        if (dataPoints.length > 1) {
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            dataPoints.forEach((point, index) => {
                const x = xPadding + ((width - 2 * xPadding) * index) / (dataPoints.length - 1);
                const y = yPadding + (height - 2 * yPadding) * (1 - point.kdr / maxKDR);

                index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });

            ctx.strokeStyle = kdr >= 1 ? '#4ade80' : '#f87171';
            ctx.stroke();

            const lastPoint = dataPoints[dataPoints.length - 1];
            const lastX = xPadding + ((width - 2 * xPadding) * (dataPoints.length - 1)) / (dataPoints.length - 1);
            const lastY = yPadding + (height - 2 * yPadding) * (1 - lastPoint.kdr / maxKDR);

            ctx.lineTo(lastX, oneKDRY);
            ctx.lineTo(xPadding, oneKDRY);
            ctx.closePath();

            ctx.fillStyle = kdr >= 1 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = kdr >= 1 ? '#4ade80' : '#f87171';
            ctx.fill();
            ctx.strokeStyle = kdr >= 1 ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = 'center';

        const maxLabels = 6;
        const labelInterval = Math.max(1, Math.floor(dataPoints.length / maxLabels));

        dataPoints.forEach((point, index) => {
            if (index % labelInterval === 0 || index === dataPoints.length - 1) {
                const x = xPadding + ((width - 2 * xPadding) * index) / (dataPoints.length - 1);
                const timeLabel = formatTime(point.timestamp);

                ctx.fillText(timeLabel, x, height - yPadding + 12);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, height - yPadding);
                ctx.lineTo(x, height - yPadding + 4);
                ctx.stroke();
            }
        });

    }, [dataPoints, kdr]);

    return (
        <div className="glass-card rounded-2xl p-2 border border-white/10">
            <div className="ml-4 flex gap-1 items-center">
                <span className="flex items-center justify-center rounded-full w-3.5 aspect-square p-0.5">
                    <span className="rounded-full w-2 aspect-square bg-red-600 animate-pulse"></span>
                </span>
                <h3 className="text-[10px] text-gray-400">Live K/D Tracking</h3>
            </div>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={80}
                    className="w-full h-[80px]"
                    style={{ imageRendering: 'auto' }}
                />
            </div>
        </div>
    );
}

export default KDTimeline;
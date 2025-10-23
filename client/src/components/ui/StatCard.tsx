import type { IconType } from 'react-icons';
import Icon from './Icon';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: IconType;
    iconColor: string;
    gradientFrom: string;
    gradientTo: string;
    valueColor?: string;
}

function StatCard({
    label,
    value,
    icon,
    iconColor,
    gradientFrom,
    gradientTo,
    valueColor = 'text-white'
}: StatCardProps) {
    return (
        <div className="glass-card flex justify-between rounded-xl p-2 border border-white/10">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
                    <Icon icon={icon} size="sm" className={iconColor} />
                </div>
                <span className="ml-1 text-sm text-gray-400 font-medium">{label}</span>
            </div>
            <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        </div>
    );
}

export default StatCard;
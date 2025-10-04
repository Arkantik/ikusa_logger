import Icon from './Icon';
import type { IconType } from 'react-icons';

interface ActionCardProps {
    title: string;
    description: string;
    icon: IconType;
    gradientFrom: string;
    gradientTo: string;
    iconColor: string;
    onClick: () => void;
}

function ActionCard({
    title,
    description,
    icon,
    gradientFrom,
    gradientTo,
    iconColor,
    onClick
}: ActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer glass-card glass-card-hover rounded-2xl p-8 group border border-white/10"
        >
            <div className="flex flex-col items-center gap-4">
                <div
                    className={`p-4 bg-gradient-to-br rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                    style={{
                        backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
                    }}
                >
                    <Icon icon={icon} size="lg" className={iconColor} />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
            </div>
        </button>
    );
}

export default ActionCard;
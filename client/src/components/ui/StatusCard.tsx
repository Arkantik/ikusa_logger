import type { IconType } from 'react-icons';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import LoadingIndicator from './LoadingIndicator';

interface StatusCardProps {
    label: string;
    isValid: boolean;
    statusText: string;
    statusIcon: IconType;
    statusColor: string;
    loading?: boolean;
    link?: {
        url: string;
        text: string;
    };
}

function StatusCard({ label, isValid, statusText, statusIcon, statusColor, loading = false, link }: StatusCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/5">
            <div className={`flex items-center justify-between ${!isValid && link && !loading && "mb-2"}`}>
                <span className="text-sm font-medium text-gray-300">{label}</span>
                {loading ? (
                    <LoadingIndicator size="sm" />
                ) : isValid ? (
                    <div className={`flex items-center gap-2 px-3 py-1 ${statusColor} rounded-full`}>
                        <Icon icon={statusIcon} size="sm" className={statusColor.replace('bg-', 'text-').replace('/20', '')} />
                        <span className={`text-xs font-semibold ${statusColor.replace('bg-', 'text-').replace('/20', '')}`}>
                            {statusText}
                        </span>
                    </div>
                ) : (
                    <Icon icon={statusIcon} size="sm" className="text-red-400" />
                )}
            </div>
            {!loading && !isValid && link && (
                <Link
                    to={link.url}
                    className="text-sm text-purple-400 hover:text-purple-300 underline inline-block mt-2"
                >
                    {link.text}
                </Link>
            )}
        </div>
    );
}

export default StatusCard;
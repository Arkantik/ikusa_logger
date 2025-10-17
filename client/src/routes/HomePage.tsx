import { os } from '@neutralinojs/lib';
import { useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { LuCheck, LuCircleAlert, LuSettings, LuFolder, LuGithub, LuPlay, LuShield } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import ActionCard from '../components/ui/ActionCard';
import Icon from '../components/ui/Icon';
import StatusCard from '../components/ui/StatusCard';
import { check_status, type LoggerStatus } from '../logic/logger-status';

function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<LoggerStatus | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const statusResult = await check_status();
                setStatus(statusResult);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        })();
    }, []);

    const actionCards = [
        {
            title: 'Record',
            description: 'Start live capture',
            icon: LuPlay,
            gradientFrom: 'rgba(139, 92, 246, 0.2)',
            gradientTo: 'rgba(236, 72, 153, 0.2)',
            iconColor: 'text-purple-400',
            onClick: () => navigate('/record')
        },
        {
            title: 'Open File',
            description: 'Import existing data',
            icon: LuFolder,
            gradientFrom: 'rgba(59, 130, 246, 0.2)',
            gradientTo: 'rgba(6, 182, 212, 0.2)',
            iconColor: 'text-blue-400',
            onClick: () => navigate('/open')
        },
        {
            title: 'Settings',
            description: 'Configure options',
            icon: LuSettings,
            gradientFrom: 'rgba(249, 115, 22, 0.2)',
            gradientTo: 'rgba(234, 179, 8, 0.2)',
            iconColor: 'text-orange-400',
            onClick: () => navigate('/settings')
        }
    ];

    const socialLinks = [
        {
            icon: FaDiscord,
            url: 'https://discord.gg/CUc38nKyDU',
            title: 'Join Discord'
        },
        {
            icon: LuGithub,
            url: 'https://github.com/Arkantik/ikusa_logger',
            title: 'View on GitHub'
        }
    ];

    return (
        <div className="flex flex-col h-full relative">
            <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="flex-1 flex items-center justify-center px-8 relative z-10">
                <div className="w-full max-w-4xl">
                    <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                                <Icon icon={LuShield} className="text-purple-400" size="lg" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">System Status</h2>
                                <p className="text-sm text-gray-400">Monitor your logger configuration</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <StatusCard
                                label="Npcap Driver"
                                isValid={status?.npcap_installed || false}
                                statusText="Installed"
                                statusIcon={status?.npcap_installed ? LuCheck : LuCircleAlert}
                                statusColor="bg-green-500/20"
                                loading={loading}
                                link={!status?.npcap_installed ? {
                                    url: 'https://npcap.com/dist/npcap-1.84.exe',
                                    text: 'Download Npcap'
                                } : undefined}
                            />

                            {(loading || status?.config_valid) && (
                                <StatusCard
                                    label="Configuration"
                                    isValid={status?.config_up_to_date || false}
                                    statusText={status?.config_up_to_date ? 'Updated' : 'Outdated'}
                                    statusIcon={status?.config_up_to_date ? LuCheck : LuCircleAlert}
                                    statusColor={status?.config_up_to_date ? 'bg-green-500/20' : 'bg-yellow-500/20'}
                                    loading={loading}
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {actionCards.map((card, index) => (
                            <ActionCard key={index} {...card} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card flex items-center justify-between px-8 py-1 relative z-10">
                <span className="text-xs text-gray-400">
                    Made by <span className="font-semibold text-gray-300">ORACLE</span> • Updated by <span className="font-semibold text-gray-300">ArkantiK</span>
                </span>

                <div className="flex gap-1.5">
                    {socialLinks.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => os.open(link.url)}
                            className="cursor-pointer p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-400 hover:text-white"
                            title={link.title}
                        >
                            <Icon icon={link.icon} size="sm" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
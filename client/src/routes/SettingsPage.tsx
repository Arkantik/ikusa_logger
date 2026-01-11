import { useEffect, useState } from 'react';
import { LuCircleCheckBig, LuFilter, LuInfo, LuNetwork } from 'react-icons/lu';
import { get_config, update_config, type Config } from '../components/create-config/config';
import Icon from '../components/ui/Icon';
import ToggleSwitch from '../components/ui/ToggleSwitch';

function SettingsPage() {
    const [config, setConfig] = useState<Config | null>(null);
    const [allInterfaces, setAllInterfaces] = useState(true);
    const [ipFilter, setIpFilter] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            const cfg = await get_config();
            setConfig(cfg);
            setAllInterfaces(cfg.all_interfaces === true || cfg.all_interfaces === undefined);
            // setIpFilter(cfg.ip_filter === true || cfg.ip_filter === undefined);
            setIpFilter(false);
        })();
    }, []);

    async function updateAllInterfaces(value: boolean) {
        setAllInterfaces(value);
        if (config) {
            await update_config({ ...config, all_interfaces: value });
            showSavedIndicator();
        }
    }

    // async function updateIpFilter(value: boolean) {
    //     setIpFilter(value);
    //     if (config) {
    //         await update_config({ ...config, ip_filter: value });
    //         showSavedIndicator();
    //     }
    // }

    function showSavedIndicator() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="flex flex-col h-full w-full p-8">
            <div className="max-w-3xl mx-auto w-full space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-linear-to-br from-orange-500/20 to-yellow-500/20 rounded-xl">
                            <Icon icon={LuInfo} size="lg" className="text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Network Settings</h2>
                            <p className="text-sm text-gray-400">Configure how the logger captures network traffic</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                                    <Icon icon={LuNetwork} className="text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">All Network Interfaces</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Capture traffic from all available network interfaces. Disable to use only the default interface.
                                    </p>
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={allInterfaces}
                                onChange={updateAllInterfaces}
                                className="ml-6"
                            />
                        </div>
                    </div>

                    {/* DISABLED due to BDO IP servers changing occassionally making this option unrialiable */}
                    {/* <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                                    <Icon icon={LuFilter} className="text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">IP Filter</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Filter packets by BDO server IPs to improve performance and accuracy. Recommended for optimal results.
                                    </p>
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={ipFilter}
                                onChange={updateIpFilter}
                                className="ml-6"
                            />
                        </div>
                    </div> */}
                </div>

                {saved && (
                    <div className="glass-card rounded-2xl p-4 border border-green-500/50 bg-green-500/10">
                        <div className="flex items-center justify-center gap-2">
                            <Icon icon={LuCircleCheckBig} size="sm" className="text-green-400" />
                            <p className="text-sm text-green-400 font-medium">
                                Settings saved successfully
                            </p>
                        </div>
                    </div>
                )}

                {config && (
                    <div className="glass-card rounded-2xl p-6 border border-white/10 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Icon icon={LuInfo} size="sm" className="text-gray-400" />
                            Configuration Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-gray-400">Patch Date</span>
                                <span className="text-sm text-white font-mono font-medium">{config.patch || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-gray-400">Identifier</span>
                                <span className="text-sm text-white font-mono font-medium">{config.identifier || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">Auto Scroll</span>
                                <span className={`text-sm font-medium ${config.auto_scroll ? 'text-green-400' : 'text-gray-400'}`}>
                                    {config.auto_scroll ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;
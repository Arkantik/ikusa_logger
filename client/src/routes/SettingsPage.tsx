import { useEffect, useState } from 'react';
import { get_config, update_config, type Config } from '../components/create-config/config';
import Select from '../components/create-config/Select';
import ToggleSwitch from '../components/ui/ToggleSwitch';

function SettingsPage() {
    const [config, setConfig] = useState<Config | null>(null);
    const [selectedInterface, setSelectedInterface] = useState(0);
    const [ipFilter, setIpFilter] = useState(false);

    useEffect(() => {
        (async () => {
            const cfg = await get_config();
            setConfig(cfg);
            setSelectedInterface(cfg.all_interfaces === true || cfg.all_interfaces === undefined ? 0 : 1);
            setIpFilter(cfg.ip_filter === true || cfg.ip_filter === undefined);
        })();
    }, []);

    async function updateInterface(value: number) {
        setSelectedInterface(value);
        if (config) {
            await update_config({ ...config, all_interfaces: value === 0 });
        }
    }

    useEffect(() => {
        if (config) {
            update_config({ ...config, ip_filter: ipFilter });
        }
    }, [ipFilter, config]);

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex items-center gap-2 mt-4">
                <label>Network Interface</label>
                <Select
                    options={['All', 'Default']}
                    selectedValue={selectedInterface}
                    onChange={updateInterface}
                    className='w-28'
                />
            </div>
            <div className="flex items-center gap-2">
                <label>Enable IP Filter</label>
                <ToggleSwitch checked={ipFilter} onChange={(checked) => setIpFilter(checked)} />
            </div>
        </div>
    );
}

export default SettingsPage;
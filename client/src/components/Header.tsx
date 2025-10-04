import { app, os, updater } from '@neutralinojs/lib';
import { useEffect, useState } from 'react';
import { LuArrowLeft, LuDownload, LuMessageCircleQuestion } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';
import Icon from './ui/Icon';

declare const NL_APPVERSION: string;

interface HeaderProps {
    onUpdateAvailable?: (available: boolean, version: string) => void;
}

function Header({ onUpdateAvailable }: HeaderProps) {
    const location = useLocation();
    const showArrow = location.pathname !== '/';
    const version = NL_APPVERSION;
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [newVersion, setNewVersion] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        checkForUpdates();
    }, []);

    async function checkForUpdates() {
        try {
            const url = 'https://raw.githubusercontent.com/Arkantik/ikusa_logger/main/version/version-manifest.json';
            const manifest = await updater.checkForUpdates(url);

            if (manifest.version !== NL_APPVERSION) {
                setUpdateAvailable(true);
                setNewVersion(manifest.version);
                onUpdateAvailable?.(true, manifest.version);
            }
        } catch (e) {
            console.error('Failed to check for updates:', e);
        }
    }

    async function handleUpdate() {
        if (updating) return;

        setUpdating(true);
        try {
            const manifestParts = newVersion.split('.');
            const currentParts = NL_APPVERSION.split('.');

            if (
                manifestParts.length !== currentParts.length ||
                manifestParts[0] !== currentParts[0] ||
                manifestParts[1] !== currentParts[1]
            ) {
                await os.execCommand(`update.bat ${newVersion}`, { background: true });
                await app.exit();
            } else {
                await updater.install();
                await app.restartProcess();
            }
        } catch (err) {
            alert('Update failed. Please check your internet connection.\n' + ((err as Error).message || err));
            console.error(err);
            setUpdating(false);
        }
    }

    function handleHelp() {
        os.open('https://github.com/Arkantik/ikusa_logger/blob/main/README.md#-troubleshooting');
    }

    return (
        <header className="glass-card flex items-center justify-between px-8 py-4 border-b-0">
            <div className="flex items-center gap-4">
                {showArrow && (
                    <Link
                        to="/"
                        className="p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                        <Icon icon={LuArrowLeft} className="text-white" />
                    </Link>
                )}
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-cta">
                        NodewarGG x Ikusa
                    </span>
                    <span className="text-xs text-gray-400">Version {version}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleHelp}
                    className="cursor-pointer p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-300 hover:text-white"
                    title="Help"
                >
                    <Icon icon={LuMessageCircleQuestion} />
                </button>

                {updateAvailable && (
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg hover:shadow-xl glow-effect"
                        title={`Update to v${newVersion}`}
                    >
                        <Icon icon={LuDownload} size="sm" />
                        {updating ? 'Updating...' : 'Update Available'}
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
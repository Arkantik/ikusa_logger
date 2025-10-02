import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { app, os, updater } from '@neutralinojs/lib';
import { check_status, type LoggerStatus } from '../logic/logger-status';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { LuCheck, LuGithub } from 'react-icons/lu';
import { FaDiscord } from 'react-icons/fa';

declare const NL_APPVERSION: string;

function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<LoggerStatus | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [fullUpdateAvailable, setFullUpdateAvailable] = useState(false);
    const [version, setVersion] = useState(NL_APPVERSION);

    async function checkForUpdates() {
        const url = 'https://raw.githubusercontent.com/Arkantik/ikusa_logger/blob/main/version/version-manifest.json';
        const manifest = await updater.checkForUpdates(url);

        if (manifest.version !== NL_APPVERSION) {
            const manifestParts = manifest.version.split('.');
            const currentParts = NL_APPVERSION.split('.');

            if (
                manifestParts.length !== currentParts.length ||
                manifestParts[0] !== currentParts[0] ||
                manifestParts[1] !== currentParts[1]
            ) {
                setFullUpdateAvailable(true);
            } else {
                setUpdateAvailable(true);
            }
            setVersion(manifest.version);
        }
    }

    async function update() {
        try {
            if (fullUpdateAvailable) {
                await os.execCommand(`update.bat ${version}`, { background: true });
                await app.exit();
            } else if (updateAvailable) {
                await updater.install();
                await app.restartProcess();
            }
        } catch (err) {
            alert('Updating went wrong, check your internet connection. ' + ((err as Error).message || err));
            console.error(err);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                console.log('Checking for updates');
                await checkForUpdates().catch((e) => console.error(e));
                console.log('Checking status');
                const statusResult = await check_status();
                setStatus(statusResult);
                console.log('Starting logger');
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        })();
    }, []);

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-2 mt-4">
                <Button className="w-32" onClick={() => navigate('/record')}>
                    Record
                </Button>
                <Button className="w-32" onClick={() => navigate('/open')} color="outline">
                    Open
                </Button>
                <Button className="w-32" onClick={() => navigate('/settings')} color="secondary">
                    Settings
                </Button>
                <Button
                    className="w-32"
                    onClick={() => os.open('https://github.com/Arkantik/ikusa_logger/blob/main/README.md')}
                    color="secondary"
                >
                    Help
                </Button>

                <div className="min-h-[32px] mt-1 text-center flex flex-col items-center justify-center">
                    {loading ? (
                        <LoadingIndicator />
                    ) : (
                        <>
                            {(updateAvailable || fullUpdateAvailable) && (
                                <Button className="w-32" onClick={update}>
                                    Update
                                </Button>
                            )}

                            {status?.npcap_installed ? (
                                <p className="flex items-center gap-1 text-green-600">Npcap found <LuCheck /></p>
                            ) : (
                                <p className="text-red-500 flex justify-center flex-col">
                                    Npcap is not installed.
                                    <a href="https://npcap.com/dist/npcap-1.78.exe" className="underline">
                                        Download
                                    </a>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="w-full flex justify-between absolute bottom-0 p-2 text-sm text-gray-300">
                <span className="text-xs">
                    Made by <b>ORACLE</b>, updated by <b>ArkantiK</b>
                </span>

                <div className="flex gap-2">
                    <button onClick={() => os.open('https://discord.gg/CUc38nKyDU')} className='cursor-pointer'>
                        <Icon icon={FaDiscord} />
                    </button>
                    <button onClick={() => os.open('https://github.com/Arkantik/ikusa_logger')} className='cursor-pointer'>
                        <Icon icon={LuGithub} />
                    </button>
                </div>
            </div>
        </>
    );
}

export default HomePage;
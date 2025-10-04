import { app, events, init, os } from '@neutralinojs/lib';
import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Modal from './components/modal/Modal';
import LoadingIndicator from './components/ui/LoadingIndicator';
import HomePage from './routes/HomePage';
import OpenPage from './routes/OpenPage';
import RecordPage from './routes/RecordPage';
import SettingsPage from './routes/SettingsPage';

function AppContent() {
    useEffect(() => {
        const killLoggerProcess = async () => {
            try {
                await os.execCommand('taskkill /F /IM logger.exe ');
            } catch (e) {
                console.error('Failed to kill logger process:', e);
            }
        };

        const exitApp = async () => {
            await killLoggerProcess();
            await app.exit();
        };

        events.on('windowClose', exitApp);

        return () => {
            events.off('windowClose', exitApp);
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col bg-background">
            <Header />
            <div className="flex-1 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/record" element={<RecordPage />} />
                    <Route path="/open" element={<OpenPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </div>
            <Modal />
        </div>
    );
}

function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        init();

        const readyHandler = () => {
            setIsReady(true);
        };

        events.on('ready', readyHandler);

        return () => {
            events.off('ready', readyHandler);
        };
    }, []);

    if (!isReady) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <LoadingIndicator />
            </div>
        );
    }

    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}

export default App;
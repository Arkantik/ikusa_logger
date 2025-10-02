import { app, events, Icon, init, MessageBoxChoice, os } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Modal from './components/modal/Modal';
import LoadingIndicator from './components/ui/LoadingIndicator';
import { get_remaining_height } from './logic/util';
import HomePage from './routes/HomePage';
import RecordPage from './routes/RecordPage';
import SettingsPage from './routes/SettingsPage';
import OpenPage from './routes/OpenPage';

function AppContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(get_remaining_height(containerRef.current, 16));
    }
  }, [location]);

  useEffect(() => {
    const closeHandler = async () => {
      if (location.pathname === '/record') {
        const result = await os.showMessageBox(
          'Confirm Exit',
          'Are you sure you want to close the Combat Logger? All unsaved logs will be lost.',
          MessageBoxChoice.YES_NO,
          Icon.WARNING
        );

        if (result === 'YES') {
          await os.execCommand('taskkill /F /IM logger.exe ');
          await app.exit();
        }
      } else {
        await os.execCommand('taskkill /F /IM logger.exe ');
        await app.exit();
      }
    };

    events.on('windowClose', closeHandler);

    return () => {
      events.off('windowClose', closeHandler);
    };
  }, [location.pathname]);

  return (
    <div className="h-full w-full">
      <div className="h-screen p-4 w-full max-w-7xl mx-auto">
        <Header />
        <div
          ref={containerRef}
          className="flex flex-col items-center"
          style={{ height: `${containerHeight}px` }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/open" element={<OpenPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
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
      <div className="h-screen w-screen flex items-center justify-center">
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
import { app, events, init, os } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Modal from './components/modal/Modal';
import LoadingIndicator from './components/ui/LoadingIndicator';
import { get_remaining_height } from './logic/util';
import HomePage from './routes/HomePage';
import RecordPage from './routes/RecordPage';
import SettingsPage from './routes/SettingsPage';

function App() {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    init();
    
    const readyHandler = () => {
      setIsReady(true);
    };
    
    const closeHandler = async () => {
      await os.execCommand('taskkill /F /IM logger.exe ');
      await app.exit();
    };

    events.on('ready', readyHandler);
    events.on('windowClose', closeHandler);

    return () => {
      events.off('ready', readyHandler);
      events.off('windowClose', closeHandler);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(get_remaining_height(containerRef.current, 16));
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-full w-full">
        <div className="h-screen p-4 w-full max-w-7xl mx-auto">
          <Header />
          <div
            ref={containerRef}
            className="mt-8 flex flex-col items-center"
            style={{ height: `${containerHeight}px` }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
        <Modal />
      </div>
    </BrowserRouter>
  );
}

export default App;
import { useState, useEffect } from 'react';

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex flex-col space-y-3">
        <div>
          <h3 className="font-medium text-sm">Update Available</h3>
          <p className="text-xs text-blue-100">
            A new version of the app is available. Update now?
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="px-3 py-1 bg-white text-blue-600 rounded text-xs font-medium hover:bg-blue-50"
          >
            Update
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-blue-700 text-white rounded text-xs hover:bg-blue-800"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
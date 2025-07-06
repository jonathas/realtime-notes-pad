import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setInstallPromptEvent(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex flex-col space-y-3">
        <div>
          <h3 className="font-medium text-sm">Install App</h3>
          <p className="text-xs text-blue-100">
            Install Notes Pad for quick access and offline use
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-white text-blue-600 rounded text-xs font-medium hover:bg-blue-50"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-blue-700 text-white rounded text-xs hover:bg-blue-800"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
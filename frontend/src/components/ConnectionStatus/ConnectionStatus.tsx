import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className={`fixed top-4 left-4 p-3 rounded-lg shadow-lg z-50 max-w-sm ${
      isOnline ? 'bg-green-600' : 'bg-red-600'
    } text-white`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm">
          {isOnline ? '🟢 Back online' : '🔴 No internet connection'}
        </span>
      </div>
      {!isOnline && (
        <p className="text-xs mt-1 text-red-100">
          Notes require server connection. Please check your internet.
        </p>
      )}
    </div>
  );
}
import { useState } from 'react';
import Modal from './Modal';

interface ServerModalProps {
  currentUrl?: string;
  onSave: (url: string) => void;
  onClose: () => void;
  allowClose?: boolean;
}

export default function ServerModal({ 
    currentUrl, 
    onSave, 
    onClose,
    allowClose = true 
  }: Readonly<ServerModalProps>) {
  const [url, setUrl] = useState(currentUrl || 'http://localhost:8000');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validateServer = async (serverUrl: string) => {
    try {
      setIsValidating(true);
      setError('');
      
      const response = await fetch(`${serverUrl}/health`);
      if (!response.ok) {
        throw new Error('Server not responding');
      }
      
      return true;
    } catch (err) {
      setError(`Unable to connect to server: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (await validateServer(url)) {
      localStorage.setItem('serverUrl', url);
      onSave(url);
      onClose();
    }
  };

  const handleClose = () => {
    if (allowClose) {
      onClose();
    }
  };

  return (
   <Modal 
      title="Configure Server" 
      onClose={handleClose}
      showCloseButton={allowClose}
    >
      <div className="space-y-4">
        {!allowClose && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            ℹ️ Please configure a server URL to continue
          </div>
        )}
        
        <div>
          <label htmlFor='url' className="block text-sm font-medium text-gray-700 mb-2">
            Server URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="http://localhost:8000"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          
          <p className="text-xs text-gray-500 mt-1">
            Try: http://localhost:8000 or http://127.0.0.1:8000
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          {allowClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isValidating || !url.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {isValidating ? 'Validating...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
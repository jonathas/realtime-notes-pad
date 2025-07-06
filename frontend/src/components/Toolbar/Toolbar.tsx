import { useEffect, useState } from 'react';
import UserProfile from '../Auth/UserProfile';
import LoginModal from '../Auth/LoginModal';
import ServerModal from '../Modals/ServerModal';
import NoteModal from '../Modals/NoteModal';
import './Toolbar.css';
import type { Note } from '../../services/storage';
import { useAuth } from '../../contexts/context';

interface ToolbarProps {
  currentNote?: {
    id: string;
    title: string;
  };
  serverUrl?: string;
  onServerChange?: (url: string) => void;
  onNoteChange?: (note: Note) => void;
  onNoteUpdate?: (updatedNote: Note) => void;
  forceShowServerModal?: boolean;
  forceShowNoteModal?: boolean;
  onServerModalClose?: () => void;
  onNoteModalClose?: () => void;
}

export default function Toolbar({ 
  currentNote, 
  serverUrl,
  onServerChange = () => {},
  onNoteChange = () => {},
  onNoteUpdate,
  forceShowServerModal = false,
  forceShowNoteModal = false,
  onServerModalClose = () => {},
  onNoteModalClose = () => {}
}: Readonly<ToolbarProps>) {
  const { currentUser } = useAuth();
  const [showServerModal, setShowServerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(forceShowNoteModal);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Update local state when forced to show modal
  useEffect(() => {
    setShowServerModal(forceShowServerModal);
  }, [forceShowServerModal]);

  useEffect(() => {
    setShowNoteModal(forceShowNoteModal);
  }, [forceShowNoteModal]);

  const handleServerModalClose = () => {
    setShowServerModal(false);
    onServerModalClose();
  };

  const handleNoteModalClose = () => {
    setShowNoteModal(false);
    onNoteModalClose();
  };

  const getDisplayTitle = () => {
    if (!serverUrl) return 'Configure Server';
    if (!currentNote) return 'Select a Note';
    return currentNote.title || 'Untitled';
  };

  return (
    <>
      <div className="toolbar">
        <div className="flex items-center space-x-3">
          <h1 className="text-sm font-normal text-gray-100">
            {getDisplayTitle()}
          </h1>
          {!serverUrl && (
            <span className="setup-indicator">
              Setup Required
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowServerModal(true)}
            className={`toolbar-button ${!serverUrl ? 'bg-orange-800 border-orange-600 text-orange-200' : ''}`}
            title="Select Server"
          >
            🌐 Server
          </button>
          
          <button
            onClick={() => setShowNoteModal(true)}
            className="toolbar-button"
            title="Select Note"
            disabled={!serverUrl}
          >
            📄 Notes
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser ? (
          <UserProfile />
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Sign In
          </button>
        )}
      </div>

      {showServerModal && (
        <ServerModal
          currentUrl={serverUrl}
          onSave={onServerChange}
          onClose={handleServerModalClose}
          allowClose={!!localStorage.getItem('serverUrl')}
        />
      )}

      {showNoteModal && serverUrl && (
        <NoteModal
          currentNoteId={currentNote?.id}
          serverUrl={serverUrl}
          onSelect={onNoteChange}
          onClose={handleNoteModalClose}
          allowClose={!!localStorage.getItem('selectedNoteId')} // Only allow close if note selected
          onNoteUpdate={onNoteUpdate}
        />
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
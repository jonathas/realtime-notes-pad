import { useEffect, useState } from 'react';
import ServerModal from '../Modals/ServerModal';
import NoteModal from '../Modals/NoteModal';
import './Toolbar.css';
import type { Note } from '../../services/storage';

interface ToolbarProps {
  currentNote?: {
    id: string;
    title: string;
  };
  serverUrl?: string;
  onServerChange?: (url: string) => void;
  onNoteChange?: (note: Note) => void;
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
  forceShowServerModal = false,
  forceShowNoteModal = false,
  onServerModalClose = () => {},
  onNoteModalClose = () => {}
}: Readonly<ToolbarProps>) {
  const [showServerModal, setShowServerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(forceShowNoteModal);

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
        />
      )}
    </>
  );
}
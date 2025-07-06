import { AuthProvider, useAuth } from './contexts';
import { useEffect, useState } from 'react';
import Editor from './components/Editor/Editor';
import StatusBar from './components/StatusBar/StatusBar';
import { loadNote, type Note } from './services/storage';
import Toolbar from './components/Toolbar/Toolbar';
import { convertUTCToLocal } from './utils/dateUtils';
import PWAUpdatePrompt from './components/PWAUpdatePrompt/PWAUpdatePrompt';
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus';
import LoginModal from './components/Auth/LoginModal';

function AppContent() {
  const { currentUser } = useAuth();
  const [note, setNote] = useState<Note>();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => 
    localStorage.getItem('serverUrl') || 'http://localhost:8000'
  );
  const [showServerModal, setShowServerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Check setup flow on app start (only if user is authenticated)
  useEffect(() => {
    if (!currentUser) return; // Don't proceed without authentication

    const storedServerUrl = localStorage.getItem('serverUrl');
    const selectedNoteId = localStorage.getItem('selectedNoteId');

    if (!storedServerUrl) {
      // No server URL - show server selection first
      setShowServerModal(true);
    } else if (!selectedNoteId) {
      // Have server URL but no note selected - show note selection
      setShowNoteModal(true);
    } else {
      // Both server and note are configured - load the selected note
      loadSelectedNote(selectedNoteId);
    }
  }, [currentUser]);

  const loadSelectedNote = async (noteId: string) => {
    try {
      const fullNote = await loadNote(noteId);
      if (fullNote) {
        setNote(fullNote);
        setLastSaved(convertUTCToLocal(fullNote.updated_at));
      }
    } catch (error) {
      console.error('Failed to load selected note:', error);
    }
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNote(updatedNote);
    setLastSaved(convertUTCToLocal(updatedNote.updated_at));
  };

  const handleServerChange = (newServerUrl: string) => {
    setServerUrl(newServerUrl);
    setShowServerModal(false);
    
    // After setting server, check if we need to select a note
    const selectedNoteId = localStorage.getItem('selectedNoteId');
    if (!selectedNoteId) {
      setShowNoteModal(true);
    } else {
      // Load the existing selected note with new server
      loadSelectedNote(selectedNoteId);
    }
  };

  const handleNoteChange = async (selectedNote: Note) => {
    // If selectedNote doesn't have content, fetch the full note
    if (!selectedNote.content && selectedNote.id) {
      try {
        const fullNote = await loadNote(selectedNote.id);
        if (fullNote) {
          setNote(fullNote);
          setLastSaved(convertUTCToLocal(fullNote.updated_at));
        }
      } catch (error) {
        console.error('Failed to load full note:', error);
        setNote(selectedNote);
      }
    } else {
      setNote(selectedNote);
    }
    
    setShowNoteModal(false);
  };

  const handleServerModalClose = () => {
    const storedServerUrl = localStorage.getItem('serverUrl');
    // Only allow closing if a server URL is set
    if (storedServerUrl) {
      setShowServerModal(false);
    }
  };

  const handleNoteModalClose = () => {
    const selectedNoteId = localStorage.getItem('selectedNoteId');
    // Only allow closing if a note is selected
    if (selectedNoteId) {
      setShowNoteModal(false);
    }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'Unknown User';
    return currentUser.displayName || currentUser.email || 'User';
  };

  // Show login modal if user is not authenticated - cannot be closed
  if (!currentUser) {
    return (
      <>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              📝 Real-Time Notes Pad
            </h1>
            <p className="text-gray-600 mb-8">
              Please sign in to access your notes
            </p>
          </div>
        </div>
        
        {/* Login modal that cannot be closed */}
        <LoginModal
          isOpen={true}
          onClose={() => {}} // Empty function - cannot be closed
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        currentNote={note}
        serverUrl={serverUrl}
        onServerChange={handleServerChange}
        onNoteChange={handleNoteChange}
        onNoteUpdate={handleNoteUpdate}
        forceShowServerModal={showServerModal}
        forceShowNoteModal={showNoteModal}
        onServerModalClose={handleServerModalClose}
        onNoteModalClose={handleNoteModalClose}
      />

      <div className="flex-1 relative">
        <Editor 
          note={note}
          onSave={setLastSaved}
          onTypingChange={setIsUserTyping}
          onConnectionChange={setIsConnected}
          onNoteUpdate={handleNoteUpdate}
          serverUrl={serverUrl}
          userName={getUserDisplayName()}
        />
      </div>
      
      <StatusBar 
        note={note} 
        lastSaved={lastSaved}
        isConnected={isConnected}
        isUserTyping={isUserTyping}
        userName={getUserDisplayName()}
      />

      {/* PWA Components */}
      <PWAUpdatePrompt />
      <ConnectionStatus />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

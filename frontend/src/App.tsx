import { useEffect, useState } from 'react';
import Editor from './components/Editor/Editor';
import StatusBar from './components/StatusBar/StatusBar';
import { loadNote, type Note } from './services/storage';
import Toolbar from './components/Toolbar/Toolbar';
import { convertUTCToLocal } from './utils/dateUtils';

export default function App() {
  const [note, setNote] = useState<Note>();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => 
    localStorage.getItem('serverUrl') || 'http://localhost:8000'
  );
  const [showServerModal, setShowServerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Check setup flow on app start
  useEffect(() => {
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
  }, []);

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
    // Also update last saved time
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
          serverUrl={serverUrl}
        />
      </div>
      
      <StatusBar 
        note={note} 
        lastSaved={lastSaved}
        isConnected={true}
        isUserTyping={isUserTyping}
        userName="Jonathas"
      />
    </div>
  );
}

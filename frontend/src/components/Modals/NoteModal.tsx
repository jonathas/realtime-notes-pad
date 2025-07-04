import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createNote, loadAllNotes, type Note } from '../../services/storage';
import { formatNoteDate, formatRelativeTime } from '../../utils/dateUtils';

interface NoteModalProps {
  currentNoteId?: string;
  serverUrl?: string;
  onSelect: (note: Note) => void;
  onClose: () => void;
  allowClose?: boolean;
}

export default function NoteModal({
  currentNoteId, 
  serverUrl, 
  onSelect, 
  onClose, 
  allowClose = true 
}: Readonly<NoteModalProps>) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError('');
        const fetchedNotes = await loadAllNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        setError(`Failed to load notes: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [serverUrl]);

  const handleSelect = (note: Note) => {
    localStorage.setItem('selectedNoteId', note.id);
    onSelect(note);
    onClose();
  };

  const handleCreateNewClick = () => {
    setNewNoteTitle('');
    setShowTitlePrompt(true);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      setError('Please enter a title for the note');
      return;
    }

    try {
      const newNote = await createNote({
        title: newNoteTitle.trim(),
        content: ''
      });
      
      localStorage.setItem('selectedNoteId', newNote.id);
      onSelect(newNote);
      onClose();
    } catch (err) {
      setError(`Failed to create new note : ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCancelCreate = () => {
    setShowTitlePrompt(false);
    setNewNoteTitle('');
    setError('');
  };

  const handleClose = () => {
    if (allowClose) {
      onClose();
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateNote();
    } else if (e.key === 'Escape') {
      handleCancelCreate();
    }
  };

  return (
    <Modal title="Select Note" onClose={handleClose} showCloseButton={allowClose}>
      <div className="space-y-4">
        {showTitlePrompt ? (
          <div className="p-4 border-2 border-blue-200 rounded bg-blue-50">
            <h3 className="font-medium text-blue-900 mb-3">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={handleTitleKeyPress}
              placeholder="Enter note title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-gray-900"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelCreate}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNoteTitle.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          /* Create New Note Button */
          <button
            onClick={handleCreateNewClick}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
          >
            + Create New Note
          </button>
        )}

        {loading && <p>Loading notes...</p>}
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {!loading && notes.length === 0 && !showTitlePrompt && (
          <p className="text-gray-500">No notes found. Create your first note above.</p>
        )}

        {!loading && notes.length > 0 && !showTitlePrompt && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelect(note)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  note.id === currentNoteId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <h3 className="font-medium">{note.title || 'Untitled'}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    {formatNoteDate(note.updated_at)},
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(note.updated_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {allowClose && !showTitlePrompt && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
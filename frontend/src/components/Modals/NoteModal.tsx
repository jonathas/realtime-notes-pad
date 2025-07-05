import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createNote, deleteNote, loadAllNotes, updateNote, type Note } from '../../services/storage';
import { formatNoteDate, formatRelativeTime } from '../../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

interface NoteModalProps {
  currentNoteId?: string;
  serverUrl?: string;
  onSelect: (note: Note) => void;
  onClose: () => void;
  allowClose?: boolean;
  onNoteUpdate?: (updatedNote: Note) => void;
}

export default function NoteModal({
  currentNoteId, 
  serverUrl, 
  onSelect, 
  onClose, 
  allowClose = true,
  onNoteUpdate
}: Readonly<NoteModalProps>) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editTitle, setEditTitle] = useState<{
    isOpen: boolean;
    noteId: string;
    currentTitle: string;
    newTitle: string;
  }>({ isOpen: false, noteId: '', currentTitle: '', newTitle: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    noteId: string;
    noteTitle: string;
  }>({ isOpen: false, noteId: '', noteTitle: '' });

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

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation(); // Prevent note selection
    setDeleteConfirmation({
      isOpen: true,
      noteId: note.id,
      noteTitle: note.title || 'Untitled'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteNote(deleteConfirmation.noteId);
      
      // Remove from local state
      setNotes(notes.filter(note => note.id !== deleteConfirmation.noteId));
      
      // If deleting the currently selected note, clear selection
      if (deleteConfirmation.noteId === currentNoteId) {
        localStorage.removeItem('selectedNoteId');
      }
      
      setDeleteConfirmation({ isOpen: false, noteId: '', noteTitle: '' });
    } catch (err) {
      setError(`Failed to delete note: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDeleteConfirmation({ isOpen: false, noteId: '', noteTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, noteId: '', noteTitle: '' });
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

  const handleEditClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation(); // Prevent note selection
    setEditTitle({
      isOpen: true,
      noteId: note.id,
      currentTitle: note.title || 'Untitled',
      newTitle: note.title || ''
    });
  };

  const handleEditConfirm = async () => {
    if (!editTitle.newTitle.trim()) {
      setError('Please enter a title for the note');
      return;
    }

    try {
      const updatedNote = await updateNote({
        id: editTitle.noteId,
        title: editTitle.newTitle.trim()
      });
      
      // Update local state
      setNotes(notes.map(note => 
        note.id === editTitle.noteId 
          ? { ...note, title: updatedNote.title }
          : note
      ));

      // Notify parent if this is the current note
      if (editTitle.noteId === currentNoteId && onNoteUpdate) {
        onNoteUpdate(updatedNote);
      }
      
      setEditTitle({ isOpen: false, noteId: '', currentTitle: '', newTitle: '' });
    } catch (err) {
      setError(`Failed to update note title: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditCancel = () => {
    setEditTitle({ isOpen: false, noteId: '', currentTitle: '', newTitle: '' });
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditConfirm();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <>
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={!newNoteTitle.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCreateNewClick}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              + Create New Note
            </button>
          )}

          {loading && <p className="text-gray-500">Loading notes...</p>}
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && notes.length === 0 && !showTitlePrompt && (
            <p className="text-gray-500">No notes found. Create your first note above.</p>
          )}

          {!loading && notes.length > 0 && !showTitlePrompt && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                        Note Title
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                        Last Updated
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-700 w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr
                        key={note.id}
                        className={`border-b hover:bg-gray-50 cursor-pointer ${
                          note.id === currentNoteId ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td 
                          className="px-4 py-3 text-sm text-gray-900"
                          onClick={() => handleSelect(note)}
                        >
                          <div className="font-medium">
                            {note.title || 'Untitled'}
                          </div>
                          {note.id === currentNoteId && (
                            <div className="text-xs text-blue-600 mt-1">
                              Currently selected
                            </div>
                          )}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm text-gray-500"
                          onClick={() => handleSelect(note)}
                        >
                          <div>{formatNoteDate(note.updated_at)}</div>
                          <div className="text-xs text-gray-400">
                            {formatRelativeTime(note.updated_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={(e) => handleEditClick(e, note)}
                              className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                              title={`Edit "${note.title || 'Untitled'}"`}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, note)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              title={`Delete "${note.title || 'Untitled'}"`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Edit Title Modal */}
      <Modal 
        title="Edit Note Title" 
        onClose={handleEditCancel} 
        showCloseButton={true}
        isOpen={editTitle.isOpen}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Note Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={editTitle.newTitle}
              onChange={(e) => setEditTitle(prev => ({ ...prev, newTitle: e.target.value }))}
              onKeyDown={handleEditKeyPress}
              placeholder="Enter note title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEditConfirm}
              disabled={!editTitle.newTitle.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteConfirmation.noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
import { useEffect, useState } from 'react'
import { loadAllNotes, updateNote, type Note } from '../../services/storage'; 
import './Editor.css'

interface EditorProps {
  onNoteChange?: (note: Note) => void;
  onSave?: (date: Date) => void;
}

export default function Editor({
  onNoteChange = () => {},
  onSave = () => {}
}: Readonly<EditorProps> = {
}) {
  const [note, setNote] = useState<Note>({} as Note);
  const [content, setContent] = useState('');
  const [hasUserTyped, setHasUserTyped] = useState(false);

  useEffect(() => {
    const loadInitialNote = async () => {
      try {
        const notes = await loadAllNotes();
        if (notes.length > 0) {
          // Load the first note if available
          const note = notes[0];
          setNote(note);
          setContent(note.content || '');
          onNoteChange(note);
          onSave(new Date(note.updated_at));
        }
      } catch (error) {
        console.error('Failed to load note:', error);
      }
    };

    loadInitialNote();
  }, [onNoteChange, onSave]);

  useEffect(() => {
    if (!hasUserTyped) return;
    const saveNoteAsync = async () => {
      try {
        await updateNote({ ...note, content });
        onSave(new Date());
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    };

    /* 
     * Debounce saving to avoid too many writes
     * This will save the note after 500ms of inactivity
     * when the user stops typing
     */
    const timeout = setTimeout(() => {
      saveNoteAsync();
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(timeout);
  }, [content, note, hasUserTyped, onSave]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUserTyped(true);
    onNoteChange({ ...note, content: e.target.value });
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="w-screen h-full p-4 text-lg font-mono focus:outline-none resize-none"
      placeholder="Start typing your collaborative note..."
      autoFocus
    />
  );
}

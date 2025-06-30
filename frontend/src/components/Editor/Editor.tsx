import { useEffect, useState } from 'react'
import { loadNote, updateNote } from '../../services/storage'; 
import './Editor.css'

export default function Editor() {
  const [content, setContent] = useState('');
  const [hasUserTyped, setHasUserTyped] = useState(false);

  useEffect(() => {
    const loadInitialNote = async () => {
      try {
        const note = await loadNote();
        if (note) {
          setContent(note.content);
        }
      } catch (error) {
        console.error('Failed to load note:', error);
      }
    };

    loadInitialNote();
  }, []);

  useEffect(() => {
    if (!hasUserTyped) return;

    const note = { id: 'current-note', title: 'Untitled', content };
    const saveNoteAsync = async () => {
      try {
        await updateNote(note);
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
  }, [content, hasUserTyped]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUserTyped(true);
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="w-screen h-screen p-4 text-lg font-mono focus:outline-none"
      placeholder="Start typing your collaborative note..."
      autoFocus
    />
  );
}

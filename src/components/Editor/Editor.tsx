import { useEffect, useState } from 'react'
import { loadNote, saveNote } from '../../services/storage'; 
import './Editor.css'

export default function Editor() {
  const [content, setContent] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadNote().then(note => {
      if (note) {
        setContent(note.content);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const note = { id: 'current-note', title: 'Untitled', content };

    /* 
     * Debounce saving to avoid too many writes
     * This will save the note after 500ms of inactivity
     * when the user stops typing
     */
    const timeout = setTimeout(() => {
      saveNote(note);
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(timeout);
  }, [content, isLoaded]);

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-screen h-screen p-4 text-lg font-mono focus:outline-none"
      placeholder="Start typing your collaborative note..."
      autoFocus
    />
  );
}

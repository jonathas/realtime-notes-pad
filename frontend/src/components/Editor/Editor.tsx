import { useEffect, useState } from 'react'
import { loadAllNotes, updateNote, type Note } from '../../services/storage'; 
import './Editor.css'

interface EditorProps {
  note?: Note;
  onNoteChange?: (note: Note) => void;
  onSave?: (date: Date) => void;
  onTypingChange?: (isTyping: boolean) => void;
  serverUrl?: string;
}

export default function Editor({
  note,
  onNoteChange = () => {},
  onSave = () => {},
  onTypingChange = () => {},
  serverUrl
}: Readonly<EditorProps> = {
}) {
  const [content, setContent] = useState('');
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Update content when note changes
  useEffect(() => {
    if (note?.content !== undefined) {
      setContent(note.content);
      setHasUserTyped(false); // Reset typing state for new note
    }
  }, [note]);

  useEffect(() => {
    if (!hasUserTyped || !serverUrl || !note) return;

    const saveNoteAsync = async () => {
      try {
        await updateNote({ ...note, content });
        onSave(new Date());
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    };

    const timeout = setTimeout(() => {
      saveNoteAsync();
    }, 500);

    return () => clearTimeout(timeout);
  }, [content, note, hasUserTyped, onSave, serverUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUserTyped(true);
    
    if (note) {
      onNoteChange({ ...note, content: e.target.value });
    }

    if (!isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }
  };

  // Show placeholder message if no server URL
  if (!serverUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>Please configure a server URL to start editing notes</p>
      </div>
    );
  }

  // Show placeholder if no note is selected
  if (!note) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>Select a note to start editing</p>
      </div>
    );
  }


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

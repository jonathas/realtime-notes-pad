import { useState } from 'react';
import Editor from './components/Editor/Editor';
import StatusBar from './components/StatusBar/StatusBar';
import type { Note } from './services/storage';

export default function App() {
  const [note, setNote] = useState<Note>();
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isUserTyping, setIsUserTyping] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 relative">
        <Editor 
          onNoteChange={setNote}
          onSave={setLastSaved}
          onTypingChange={setIsUserTyping}
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

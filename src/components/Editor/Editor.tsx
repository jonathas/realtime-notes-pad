import { useState } from 'react'
import './Editor.css'

export default function Editor() {
  const [text, setText] = useState('');

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-screen h-screen p-4 text-lg font-mono focus:outline-none"
      placeholder="Start typing your collaborative note..."
      autoFocus
    />
  );
}

import { useEffect, useState, useRef } from 'react';
import { type Note } from '../../services/storage';
import { useWebSocket } from '../../hooks/useWebSocket';

interface EditorProps {
  note?: Note;
  onSave?: (date: Date) => void;
  onTypingChange: (isTyping: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  serverUrl: string;
}

export default function Editor({ note, onSave, onTypingChange, onConnectionChange, serverUrl }: Readonly<EditorProps>) {
  const [content, setContent] = useState('');
  const [otherUsersTyping, setOtherUsersTyping] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingFromRemote = useRef(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  // WebSocket connection
  const {
    isConnected,
    sendContentChange,
    sendTypingIndicator,
  } = useWebSocket({
    serverUrl,
    noteId: note?.id,
    userName: 'Jonathas', // You can make this dynamic
    onContentChange: (newContent, userName) => {
      if (userName !== 'Jonathas') { // Don't update from our own changes
        isUpdatingFromRemote.current = true;
        setContent(newContent);
        setTimeout(() => {
          isUpdatingFromRemote.current = false;
        }, 100);
      }
    },
    onTypingChange: (isTyping, userName) => {
      if (userName !== 'Jonathas') {
        setOtherUsersTyping(prev => {
          if (isTyping) {
            return prev.includes(userName) ? prev : [...prev, userName];
          } else {
            return prev.filter(u => u !== userName);
          }
        });
      }
    },
    onConnectionChange: onConnectionChange,
    onContentSaved: () => {
      onSave?.(new Date());
    }
  });

  // Pass connection status to parent
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

  // Load note content when note changes
  useEffect(() => {
    if (note?.content !== undefined) {
      setContent(note.content);
    }
  }, [note?.content]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    if (isUpdatingFromRemote.current) return;

    // Prevent editing if not connected
    if (!isConnected) {
      console.warn('Cannot edit - WebSocket not connected');
      return;
    }

    setContent(newContent);
    
    // Send typing indicator
    sendTypingIndicator(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 1 second of no typing
    typingTimeoutRef.current = window.setTimeout(() => {
      sendTypingIndicator(false);
      onTypingChange(false);
    }, 1000);

    // Send content changes to other users
    sendContentChange(newContent);
    
    // Update local typing state
    onTypingChange(true);
  };

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
    <div className="h-full flex flex-col">
      {/* Connection warning - show if disconnected */}
      {!isConnected && (
        <div className="px-4 py-2 bg-red-50 border-b text-sm">
          <span className="text-red-600 font-medium">
            ⚠️ Connection lost - editing disabled until reconnected
          </span>
        </div>
      )}

      {/* Typing indicators - only show if others are typing */}
      {otherUsersTyping.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm">
          <span className="text-blue-600 italic">
            {otherUsersTyping.join(', ')} {otherUsersTyping.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={!isConnected}
          className="w-full h-full p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed"
          placeholder="Start typing your note..."
          spellCheck={false}
        />

        {/* Overlay when disconnected */}
        {!isConnected && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg border">
              <span className="text-gray-600 text-sm">
                🔄 Reconnecting to server...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
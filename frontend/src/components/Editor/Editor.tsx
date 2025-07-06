import { useEffect, useState, useRef } from 'react';
import { type Note } from '../../services/storage';
import { useWebSocket } from '../../hooks/useWebSocket';

interface EditorProps {
  note?: Note;
  onSave?: (date: Date) => void;
  onTypingChange: (isTyping: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  onNoteUpdate?: (updatedNote: Note) => void;
  serverUrl: string;
  userName: string;
}

export default function Editor({ 
  note, 
  onSave, 
  onTypingChange, 
  onConnectionChange,
  onNoteUpdate,
  serverUrl,
  userName
}: Readonly<EditorProps>) {
  const [content, setContent] = useState('');
  const [otherUsersTyping, setOtherUsersTyping] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingFromRemote = useRef(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const lastSentContentRef = useRef<string>('');
  const lastLocalEditRef = useRef<number>(0);

  // WebSocket connection
  const {
    isConnected,
    sendContentChange,
    sendTypingIndicator,
  } = useWebSocket({
    serverUrl,
    noteId: note?.id,
    userName,
    onContentChange: (newContent, senderUserName) => {
      console.log('📨 Content change received:', {
        content: newContent.substring(0, 50),
        sender: senderUserName,
        currentUser: userName,
        isFromSelf: senderUserName === userName,
        currentContent: content.substring(0, 50),
        lastSent: lastSentContentRef.current.substring(0, 50)
      });
      
      // If this is from another user, apply the change
      if (senderUserName !== userName) {
        console.log('✅ Applying remote content change from', senderUserName);
        isUpdatingFromRemote.current = true;
        setContent(newContent);

        // Update the note object when content changes from other users
        if (note && onNoteUpdate) {
          onNoteUpdate({
            ...note,
            content: newContent,
            updated_at: new Date().toISOString()
          });
        }

        // Clear the flag after a short delay
        setTimeout(() => {
          isUpdatingFromRemote.current = false;
        }, 100);
      } else {
        // This is our own message echoed back from the server
        console.log('🔄 Received own message back from server');
        
        // Check if we recently sent this exact content
        const timeSinceLastEdit = Date.now() - lastLocalEditRef.current;
        const isRecentEdit = timeSinceLastEdit < 5000; // Within 5 seconds
        const isExactMatch = newContent === lastSentContentRef.current;
        
        console.log('🔍 Echo analysis:', {
          isRecentEdit,
          isExactMatch,
          timeSince: timeSinceLastEdit,
          serverContent: newContent.length,
          localContent: content.length
        });
        
        // Only apply if:
        // 1. It's not a recent edit we made, OR
        // 2. There's a significant difference from what we have locally
        if (!isRecentEdit || content !== newContent) {
          if (content !== newContent) {
            console.log('⚠️  Content drift detected, syncing with server');
            isUpdatingFromRemote.current = true;
            setContent(newContent);
            
            setTimeout(() => {
              isUpdatingFromRemote.current = false;
            }, 100);
          }
        } else {
          console.log('🚫 Ignoring own echo - content is current');
        }
        
        // Always update our reference for future comparisons
        lastSentContentRef.current = newContent;
      }
    },
    onTypingChange: (isTyping, senderUserName) => {
      console.log('⌨️  Typing change:', { isTyping, sender: senderUserName, currentUser: userName });
      
      // Only show typing indicators from other users
      if (senderUserName !== userName) {
        setOtherUsersTyping(prev => {
          if (isTyping) {
            return prev.includes(senderUserName) ? prev : [...prev, senderUserName];
          } else {
            return prev.filter(u => u !== senderUserName);
          }
        });
      }
    },
    onConnectionChange: onConnectionChange,
    onContentSaved: () => {
      console.log('💾 Content saved confirmation received');
      onSave?.(new Date());

      // Update the note object when content is saved
      if (note && onNoteUpdate) {
        onNoteUpdate({
          ...note,
          content: content,
          updated_at: new Date().toISOString()
        });
      }
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
      console.log('📝 Loading note content:', note.content.substring(0, 50));
      setContent(note.content);
      lastSentContentRef.current = note.content;
      lastLocalEditRef.current = 0; // Reset edit timestamp
    }
  }, [note?.content]);

  // Handle content changes from user input
  const handleContentChange = (newContent: string) => {
    // Don't process changes if we're updating from remote
    if (isUpdatingFromRemote.current) {
      console.log('🚫 Ignoring change - currently updating from remote');
      return;
    }

    // Prevent editing if not connected
    if (!isConnected) {
      console.warn('Cannot edit - WebSocket not connected');
      return;
    }

    console.log('✏️  Local content change:', {
      newLength: newContent.length,
      oldLength: content.length,
      preview: newContent.substring(0, 50)
    });

    // Record the timestamp of this local edit
    lastLocalEditRef.current = Date.now();

    // Update local state immediately
    setContent(newContent);

    // Update note object
    if (note && onNoteUpdate) {
      onNoteUpdate({
        ...note,
        content: newContent,
        updated_at: new Date().toISOString()
      });
    }
    
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
    console.log('📤 Sending content change to other users');
    sendContentChange(newContent);
    lastSentContentRef.current = newContent;
    
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

  // Debug logging for content changes
  useEffect(() => {
    console.log('📄 Content state updated:', {
      length: content.length,
      preview: content.substring(0, 50),
      isRemoteUpdate: isUpdatingFromRemote.current,
      lastEdit: lastLocalEditRef.current ? `${Date.now() - lastLocalEditRef.current}ms ago` : 'never'
    });
  }, [content]);

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
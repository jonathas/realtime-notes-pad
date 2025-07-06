import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService, type WebSocketMessage } from '../services/websocket';

interface UseWebSocketOptions {
  serverUrl: string;
  noteId?: string;
  userName?: string;
  onContentChange?: (content: string, userName: string) => void;
  onTypingChange?: (isTyping: boolean, userName: string) => void;
  onUserJoined?: (userName: string) => void;
  onUserLeft?: (userName: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onContentSaved?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocketService | null>(null);

  // Initialize WebSocket service
  useEffect(() => {
    console.log('🔧 Initializing WebSocket service:', options.serverUrl, options.userName);
    
    if (!wsRef.current || wsRef.current.serverUrl !== options.serverUrl) {
      // Disconnect existing connection
      wsRef.current?.disconnect();
      
      // Create new service
      wsRef.current = new WebSocketService(options.serverUrl, options.userName || 'Anonymous');
      
      // Set up event handlers
      wsRef.current.onConnectionChange = (connected: boolean) => {
        console.log('🔗 Connection state changed:', connected);
        setIsConnected(connected);
        options.onConnectionChange?.(connected);
      };
      
      wsRef.current.onContentChange = (data: WebSocketMessage) => {
        console.log('📨 Content change received in hook:', {
          content: data.content?.substring(0, 50),
          sender: data.user_name,
          currentUser: options.userName
        });
        
        if (data.content !== undefined && data.user_name && options.onContentChange) {
          // Always pass the message to the Editor - let Editor decide what to do
          options.onContentChange(data.content, data.user_name);
        }
      };

      wsRef.current.onTypingIndicator = (data: WebSocketMessage) => {
        console.log('⌨️  Typing indicator received in hook:', data.is_typing, 'from:', data.user_name);
        if (data.user_name && typeof data.is_typing === 'boolean' && options.onTypingChange) {
          options.onTypingChange(data.is_typing, data.user_name);
        }
      };

      wsRef.current.onUserJoined = (data: WebSocketMessage) => {
        if (data.user_name) {
          setConnectedUsers(prev => [...prev.filter(u => u !== data.user_name), data.user_name!]);
          options.onUserJoined?.(data.user_name);
        }
      };

      wsRef.current.onUserLeft = (data: WebSocketMessage) => {
        if (data.user_name) {
          setConnectedUsers(prev => prev.filter(u => u !== data.user_name));
          options.onUserLeft?.(data.user_name);
        }
      };

      wsRef.current.onContentSaved = () => {
        console.log('💾 Content saved event received in hook');
        options.onContentSaved?.();
      };
    }
  }, [options.serverUrl, options.userName, options]);

  // Connect to note
  useEffect(() => {
    if (wsRef.current && options.noteId) {
      console.log('🔌 Connecting to note:', options.noteId);
      wsRef.current.connect(options.noteId).catch(console.error);
    }
    
    return () => {
      wsRef.current?.disconnect();
    };
  }, [options.noteId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.disconnect();
    };
  }, []);

  const sendContentChange = useCallback((content: string) => {
    console.log('📤 Hook sending content change:', content.substring(0, 50));
    wsRef.current?.sendContentChange(content);
  }, []);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    console.log('📤 Hook sending typing indicator:', isTyping);
    wsRef.current?.sendTypingIndicator(isTyping);
  }, []);

  const sendCursorPosition = useCallback((position: number) => {
    wsRef.current?.sendCursorPosition(position);
  }, []);

  return {
    isConnected,
    connectedUsers,
    sendContentChange,
    sendTypingIndicator,
    sendCursorPosition,
  };
}
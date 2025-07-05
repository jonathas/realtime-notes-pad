export interface WebSocketMessage {
  type: 'content_change' | 'cursor_position' | 'typing_indicator' | 'user_joined' | 'user_left' | 'content_saved';
  content?: string;
  position?: number;
  is_typing?: boolean;
  user_name?: string;
  timestamp?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private noteId: string | null = null;
  private readonly userName: string;
  public serverUrl: string;
  private reconnectInterval: number | null = null;
  private isReconnecting = false;

  // Event callbacks
  public onContentChange: ((data: WebSocketMessage) => void) | null = null;
  public onUserJoined: ((data: WebSocketMessage) => void) | null = null;
  public onUserLeft: ((data: WebSocketMessage) => void) | null = null;
  public onTypingIndicator: ((data: WebSocketMessage) => void) | null = null;
  public onConnectionChange: ((connected: boolean) => void) | null = null;
  public onContentSaved: (() => void) | null = null;

  constructor(serverUrl: string, userName: string = 'Anonymous') {
    this.serverUrl = serverUrl;
    this.userName = userName;
  }

  connect(noteId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.disconnect();
      }

      this.noteId = noteId;
      const wsUrl = `${this.serverUrl.replace('http', 'ws')}/ws/${noteId}?user_name=${encodeURIComponent(this.userName)}`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isReconnecting = false;
        this.clearReconnectTimer();
        this.onConnectionChange?.(true);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.onConnectionChange?.(false);
        
        // Auto-reconnect unless it was a manual disconnect
        if (event.code !== 1000 && !this.isReconnecting) {
          this.startReconnecting();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };
    });
  }

  private handleMessage(data: WebSocketMessage) {
    console.log('📨 Received WebSocket message:', data);

    switch (data.type) {
      case 'content_change':
        this.onContentChange?.(data);
        break;
      case 'user_joined':
        this.onUserJoined?.(data);
        break;
      case 'user_left':
        this.onUserLeft?.(data);
        break;
      case 'typing_indicator':
        this.onTypingIndicator?.(data);
        break;
      case 'content_saved':
        console.log('🎉 Content saved message received!');
        this.onContentSaved?.();
        break;
      default:
        console.log('Unknown message type:', data);
    }
  }

  private startReconnecting() {
    if (this.isReconnecting || !this.noteId) return;
    
    this.isReconnecting = true;
    console.log('🔄 Attempting to reconnect...');

    this.reconnectInterval = window.setInterval(() => {
      if (this.noteId) {
        this.connect(this.noteId).catch(() => {
          console.log('Reconnection failed, will retry...');
        });
      }
    }, 3000); // Retry every 3 seconds
  }

  private clearReconnectTimer() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  sendContentChange(content: string) {
    const message: WebSocketMessage = {
      type: 'content_change',
      content,
      timestamp: new Date().toISOString()
    };
    console.log('📤 Sending content change:', message);
    this.send(message);
  }

  sendTypingIndicator(isTyping: boolean) {
    const message: WebSocketMessage = {
      type: 'typing_indicator',
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };
    console.log('📤 Sending typing indicator:', message);
    this.send(message);
  }

  sendCursorPosition(position: number) {
    const message: WebSocketMessage = {
      type: 'cursor_position',
      position,
      timestamp: new Date().toISOString()
    };
    console.log('📤 Sending cursor position:', message);
    this.send(message);
  }

  private send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('📤 Sending raw message:', messageStr);
      this.ws.send(messageStr);
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  disconnect() {
    this.clearReconnectTimer();
    this.isReconnecting = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  updateServerUrl(newServerUrl: string) {
    this.serverUrl = newServerUrl;
    if (this.noteId && this.isConnected()) {
      // Reconnect with new server URL
      this.disconnect();
      this.connect(this.noteId);
    }
  }
}
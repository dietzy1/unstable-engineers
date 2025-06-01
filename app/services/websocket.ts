import {
  CreateLobbyPayload,
  JoinLobbyPayload,
  MessageType,
  ReorderPlayersPayload,
} from './payload';

// Type-safe message interface
export interface Message<T = any> {
  type: MessageType;
  payload: T;
}

// WebSocket service class
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<MessageType, ((payload: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(private baseUrl: string) {}

  // Connect to WebSocket server
  connect(userId: string, username: string, avatarId: string, lobbyId?: string) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('userId', userId);
    url.searchParams.append('username', username);
    url.searchParams.append('avatarId', avatarId);
    if (lobbyId) {
      url.searchParams.append('lobbyId', lobbyId);
    }

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(userId, username, avatarId, lobbyId);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        console.log('Received message:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  // Attempt to reconnect
  private attemptReconnect(userId: string, username: string, avatarId: string, lobbyId?: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(
      () => {
        this.reconnectAttempts++;
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect(userId, username, avatarId, lobbyId);
      },
      Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    );
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Send message to server
  sendMessage<T>(type: MessageType, payload: T) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: Message<T> = { type, payload };
    this.ws.send(JSON.stringify(message));
  }

  // Handle incoming message
  private handleMessage(message: Message) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }
  }

  // Subscribe to message type with type-safe payload
  on<T>(type: MessageType, handler: (payload: T) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler as (payload: any) => void);
  }

  // Unsubscribe from message type
  off<T>(type: MessageType, handler: (payload: T) => void) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler as (payload: any) => void);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Create a new lobby
  createLobby(gameName: string, maxPlayers: number) {
    const payload: CreateLobbyPayload = { gameName, maxPlayers };
    this.sendMessage('create_lobby', payload);
  }

  // Join an existing lobby
  joinLobby(lobbyId: string) {
    const payload: JoinLobbyPayload = { lobbyId };
    this.sendMessage('join_lobby', payload);
  }

  // Leave current lobby
  leaveLobby() {
    this.sendMessage('leave_lobby', {});
  }

  // Toggle ready status
  toggleReady() {
    this.sendMessage('toggle_ready', {});
  }

  // Start the game
  startGame() {
    this.sendMessage('start_game', {});
  }

  // Reorder players
  reorderPlayers(playerOrder: string[]) {
    const payload: ReorderPlayersPayload = { playerOrder };
    this.sendMessage('reorder_players', payload);
  }
}

// Create singleton instance
export const wsService = new WebSocketService('ws://localhost:8080/ws');

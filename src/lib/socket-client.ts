import { io, Socket } from 'socket.io-client';

export type SocketEvents =
  | 'connected'
  | 'disconnected'
  | 'player_joined'
  | 'player_left'
  | 'user_typing_start'
  | 'user_typing_stop'
  | 'message_received'
  | 'question_delivered'
  | 'answer_result'
  | 'round_completed'
  | 'game_completed'
  | 'game_state'
  | 'connect_error'
  | 'reconnect_error';

export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  messageType?: 'text' | 'system';
}

export class GameSocketClient {
  private socket: Socket | null = null;
  private readonly url: string;
  private tokenProvider: () => string | null;
  private lastRoomCode: string | null = null;
  private pingIntervalId: any = null;

  constructor(url: string, tokenProvider: () => string | null) {
    this.url = url;
    this.tokenProvider = tokenProvider;
  }

  connect() {
    const token = this.tokenProvider();
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // Never stop trying to reconnect
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
      auth: { token },
    });

    // Auto re-join last room on connect/reconnect
    this.socket.on('connect', () => {
      console.log('Connected to server');
      if (this.lastRoomCode) {
        console.log(`Auto-rejoining room: ${this.lastRoomCode}`);
        this.socket?.emit('join_room', { roomCode: this.lastRoomCode });
      }
      // start keep-alive ping
      if (this.pingIntervalId) clearInterval(this.pingIntervalId);
      this.pingIntervalId = setInterval(() => {
        if (this.socket?.connected) {
          this.socket.emit('ping', () => {});
        }
      }, 30000); // Every 30 seconds
    });

    this.socket.io.on('reconnect', () => {
      console.log('Reconnected to server');
      if (this.lastRoomCode) {
        console.log(`Auto-rejoining room: ${this.lastRoomCode}`);
        this.socket?.emit('join_room', { roomCode: this.lastRoomCode });
      }
    });

    // Refresh token on reconnect attempts
    this.socket.io.on('reconnect_attempt', () => {
      const freshToken = this.tokenProvider();
      if (freshToken && this.socket) {
        this.socket.emit('refresh_auth', { token: freshToken });
      }
    });

    // Enhanced error handling
    this.socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      // Emit event for UI to handle
      this.socket?.emit('connect_error', error);
    });

    this.socket.io.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error);
      // Emit event for UI to handle
      this.socket?.emit('reconnect_error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected us (likely auth issue)
        this.socket?.emit('server_disconnect', reason);
      } else {
        // Network issue, will auto-reconnect
        this.socket?.emit('network_disconnect', reason);
      }
    });

    return this.socket;
  }

  on(event: SocketEvents | string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  onAny(handler: (event: string, ...args: any[]) => void) {
    this.socket?.onAny(handler);
  }

  off(event: SocketEvents | string, handler?: (...args: any[]) => void) {
    if (handler) this.socket?.off(event, handler);
    else this.socket?.off(event);
  }

  disconnect() {
    if (this.socket) {
      if (this.pingIntervalId) {
        clearInterval(this.pingIntervalId);
        this.pingIntervalId = null;
      }
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Actions
  joinRoom(roomCode: string) {
    this.lastRoomCode = roomCode;
    this.socket?.emit('join_room', { roomCode });
  }

  toggleReady(isReady: boolean) {
    this.socket?.emit('player_ready', { isReady });
  }

  startGame() {
    this.socket?.emit('start_game');
  }

  sendChat(message: string, messageType: 'text' | 'system' = 'text') {
    this.socket?.emit('send_message', { message, messageType });
  }

  startTyping() {
    this.socket?.emit('typing_start', {});
  }

  stopTyping() {
    this.socket?.emit('typing_stop', {});
  }

  submitAnswer(answer: string) {
    this.socket?.emit('submit_answer', { answer });
  }

  requestGameState() {
    this.socket?.emit('get_game_state');
  }
}

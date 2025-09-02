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
  | 'game_state';

export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export class GameSocketClient {
  private socket: Socket | null = null;
  private readonly url: string;
  private tokenProvider: () => string | null;

  constructor(url: string, tokenProvider: () => string | null) {
    this.url = url;
    this.tokenProvider = tokenProvider;
  }

  connect() {
    const token = this.tokenProvider();
    this.socket = io(this.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: { token },
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
    this.socket?.disconnect();
    this.socket = null;
  }

  // Actions
  joinRoom(roomCode: string) {
    this.socket?.emit('join_room', { roomCode });
  }

  toggleReady(isReady: boolean) {
    this.socket?.emit('player_ready', { isReady });
  }

  startGame() {
    this.socket?.emit('start_game');
  }

  sendChat(message: string) {
    this.socket?.emit('send_message', { message });
  }

  submitAnswer(answer: string) {
    this.socket?.emit('submit_answer', { answer });
  }

  requestGameState() {
    this.socket?.emit('get_game_state');
  }
}

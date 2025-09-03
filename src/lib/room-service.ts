import { smartJoinRoom, GameSession } from './games-api';
import { GameSocketClient } from './socket-client';

export interface RoomConfig {
  maxPlayers: number;
  questionCount: number;
  timePerQuestion: number;
  categories: string[];
  difficultyRange: string[];
  isPrivate?: boolean;
  allowSpectators?: boolean;
  roomName?: string;
  password?: string;
}

export class RoomService {
  private socketClient: GameSocketClient | null = null;

  constructor(socketClient: GameSocketClient) {
    this.socketClient = socketClient;
  }

  async createRoom(roomConfig: RoomConfig) {
    const response = await fetch('/api/games/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ gameConfiguration: roomConfig })
    });

    const result = await response.json();
    
    if (result.success) {
      // Navigate to lobby immediately after creation
      const roomCode = result.data.roomCode;
      localStorage.setItem('lastRoomCode', roomCode);
      
      // Use smart join to get room state
      await this.smartJoinRoom(roomCode, true);
      
      return { success: true, roomCode, gameSession: result.data.gameSession };
    }
    
    throw new Error(result.error?.message || 'Failed to create room');
  }

  async smartJoinRoom(roomCode: string, isHost: boolean = false) {
    const response = await fetch(`/api/games/${roomCode}/smart-join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ isHost })
    });

    const result = await response.json();
    
    if (result.success) {
      // Join via WebSocket for real-time updates
      if (this.socketClient) {
        this.socketClient.joinRoom(roomCode);
      }
      
      return result.data;
    }
    
    throw new Error(result.error?.message || 'Failed to join room');
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }
}

// Export a singleton instance
let roomServiceInstance: RoomService | null = null;

export function getRoomService(socketClient?: GameSocketClient): RoomService {
  if (!roomServiceInstance && socketClient) {
    roomServiceInstance = new RoomService(socketClient);
  }
  return roomServiceInstance!;
}

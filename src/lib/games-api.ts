import { api } from './api';

export type GameStatus = 'waiting' | 'starting' | 'in_progress' | 'completed' | 'paused';

export interface Player {
  userId: string;
  username: string;
  displayName?: string;
  isHost: boolean;
  isReady: boolean;
  connectionStatus: 'connected' | 'disconnected';
  joinedAt: string;
  score?: number;
  rank?: number;
}

export type Category = 'geography' | 'history' | 'science' | 'sports' | 'entertainment' | 'general';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameConfiguration {
  maxPlayers: number;
  questionCount: number;
  timePerQuestion: number; // seconds
  isPrivate: boolean;
  allowSpectators?: boolean;
  categories?: Category[];
  difficultyRange?: Difficulty[];
  roomName?: string;
  password?: string;
}

export interface GameState {
  status: GameStatus;
  currentQuestion: number;
  totalQuestions: number;
}

export interface GameSession {
  roomCode: string;
  gameState: GameState;
  players: Player[];
  gameConfiguration: GameConfiguration;
  playerCount: number;
  hasCapacity: boolean;
  isActive: boolean;
}

export interface CreateRoomInput {
  gameConfiguration: {
    maxPlayers: number;          // 2..20
    questionCount: number;       // 5..50
    timePerQuestion: number;     // 5..60 seconds
    categories: Category[];
    difficultyRange: Difficulty[];
    isPrivate?: boolean;
    allowSpectators?: boolean;
    roomName?: string;
    password?: string;
  };
}

export interface CreateRoomResponse {
  success: boolean;
  data: {
    roomCode: string;
    gameSession: GameSession;
  };
}

export interface JoinRoomResponse {
  success: boolean;
  data: {
    gameSession: GameSession;
  };
}

export interface JoinOrReconnectResponse {
  success: boolean;
  data: {
    gameSession: GameSession;
    wasReconnected: boolean;
  };
}

export interface SmartJoinResponse {
  success: boolean;
  data: {
    gameSession: GameSession;
    isHost: boolean;
    alreadyInRoom: boolean;
  };
}

export interface ActiveSessionResponse {
  hasActiveSession: boolean;
  gameSession?: GameSession;
}

export interface RoomsListResponse {
  rooms: GameSession[];
  count: number;
}

export const createRoom = async (input: CreateRoomInput) => {
  return await api.post<CreateRoomResponse>('/api/games/create', input);
};

export const joinRoom = async (roomCode: string, password?: string) => {
  const body = password ? { password } : {};
  return api.post<JoinRoomResponse>(`/api/games/${roomCode}/join`, body);
};

export const joinOrReconnectRoom = async (roomCode: string, password?: string) => {
  const body = password ? { password } : {};
  return api.post<JoinOrReconnectResponse>(`/api/games/${roomCode}/join-or-reconnect`, body);
};

export const smartJoinRoom = async (roomCode: string, options: { isHost?: boolean; password?: string } = {}) => {
  return api.post<SmartJoinResponse>(`/api/games/${roomCode}/smart-join`, options);
};

export const getActiveSession = async () => {
  return api.get<ActiveSessionResponse>('/api/games/me/active');
};

export const getRoom = async (roomCode: string) => {
  return api.get<GameSession>(`/api/games/${roomCode}`);
};

export const leaveRoom = async (roomCode: string) => {
  return api.delete<{ message: string }>(`/api/games/${roomCode}/leave`);
};

export const setReady = async (roomCode: string, isReady: boolean) => {
  return api.patch<JoinRoomResponse>(`/api/games/${roomCode}/ready`, { isReady });
};

export const startGame = async (roomCode: string) => {
  return api.post<{ message: string }>(`/api/games/${roomCode}/start`, {});
};

export const listRooms = async (params?: { status?: 'waiting' | 'starting' | 'in_progress'; hasCapacity?: boolean; limit?: number; skip?: number; }) => {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (typeof params?.hasCapacity === 'boolean') search.set('hasCapacity', String(params.hasCapacity));
  if (typeof params?.limit === 'number') search.set('limit', String(params.limit));
  if (typeof params?.skip === 'number') search.set('skip', String(params.skip));
  const qs = search.toString();
  const endpoint = qs ? `/api/games/rooms?${qs}` : '/api/games/rooms';
  return api.get<RoomsListResponse>(endpoint);
};

export const searchRooms = async (filters: {
  status?: string;
  hasCapacity?: boolean;
  categories?: string[];
  difficultyRange?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  isPrivate?: boolean;
  limit?: number;
  skip?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  const endpoint = `/api/games/search?${params.toString()}`;
  return api.get<RoomsListResponse>(endpoint);
};

export const updateRoomSettings = async (roomCode: string, settings: Partial<GameConfiguration>) => {
  return api.patch<JoinRoomResponse>(`/api/games/${roomCode}/settings`, settings);
};

export const transferHost = async (roomCode: string, newHostId: string) => {
  return api.post<JoinRoomResponse>(`/api/games/${roomCode}/transfer-host`, { newHostId });
};

export const kickPlayer = async (roomCode: string, targetUserId: string) => {
  return api.delete<{ message: string }>(`/api/games/${roomCode}/kick/${targetUserId}`);
};

export const getRoomStats = async (roomCode: string) => {
  return api.get<any>(`/api/games/${roomCode}/stats`);
};

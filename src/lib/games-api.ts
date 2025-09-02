import { api } from './api';

export type GameStatus = 'waiting' | 'starting' | 'in_progress' | 'completed' | 'paused';

export interface Player {
  userId: string;
  username: string;
  isReady: boolean;
  score: number;
  rank: number;
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
}

export interface GameState {
  status: GameStatus;
  currentQuestion: number;
  totalQuestions: number;
}

export interface Room {
  _id: string;
  roomCode: string;
  gameState: GameState;
  players: Player[];
  gameConfiguration: GameConfiguration;
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
  };
}

export interface CreateRoomResponse {
  message: string;
  room: Room;
  roomCode: string;
}

export interface JoinRoomResponse {
  message: string;
  room: Room;
}

export interface ActiveSessionResponse {
  hasActiveSession: boolean;
  room?: Room;
}

export interface RoomsListResponse {
  rooms: Room[];
  pagination: { total: number; limit: number; skip: number; hasMore: boolean };
}

export const createRoom = async (input: CreateRoomInput) => {
  return await api.post<CreateRoomResponse>('/api/games/create', input);
};

export const joinRoom = async (roomCode: string, body: Record<string, unknown> = {}) => {
  return api.post<JoinRoomResponse>(`/api/games/${roomCode}/join`, body);
};

export const getActiveSession = async () => {
  return api.get<ActiveSessionResponse>('/api/games/me/active');
};

export const getRoom = async (roomCode: string) => {
  return api.get<Room>(`/api/games/${roomCode}`);
};

export const leaveRoom = async (roomCode: string) => {
  return api.delete<{ message: string }>(`/api/games/${roomCode}/leave`);
};

export const setReady = async (roomCode: string, isReady: boolean) => {
  return api.post<JoinRoomResponse>(`/api/games/${roomCode}/ready`, { isReady });
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

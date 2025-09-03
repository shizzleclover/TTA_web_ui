import { create } from 'zustand';
import { GameSession } from '@/lib/games-api';
import { ChatMessage } from '@/lib/socket-client';

export interface Player {
  userId: string;
  username: string;
  displayName?: string;
  isHost: boolean;
  isReady: boolean;
  connectionStatus: 'connected' | 'disconnected';
  score: number;
  joinedAt: string;
}

interface RoomState {
  currentRoom: string | null;
  isHost: boolean;
  players: Player[];
  chatMessages: ChatMessage[];
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  gameState: 'lobby' | 'playing' | 'finished';
  currentQuestion: any;
  timer: number;
}

interface RoomActions {
  setRoom: (roomCode: string, isHost: boolean) => void;
  updateRoom: (gameSession: GameSession) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (userId: string) => void;
  updatePlayer: (userId: string, updates: Partial<Player>) => void;
  addChatMessage: (message: ChatMessage) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  setGameState: (state: 'lobby' | 'playing' | 'finished') => void;
  setCurrentQuestion: (question: any) => void;
  setTimer: (time: number) => void;
  clearRoom: () => void;
}

type RoomStore = RoomState & RoomActions;

export const useRoomStore = create<RoomStore>((set, get) => ({
  // State
  currentRoom: null,
  isHost: false,
  players: [],
  chatMessages: [],
  connectionStatus: 'disconnected',
  gameState: 'lobby',
  currentQuestion: null,
  timer: 0,

  // Actions
  setRoom: (roomCode: string, isHost: boolean) => {
    set({ currentRoom: roomCode, isHost });
  },

  updateRoom: (gameSession: GameSession) => {
    set({
      players: gameSession.players || [],
      gameState: gameSession.gameState?.status === 'in_progress' ? 'playing' : 
                 gameSession.gameState?.status === 'finished' ? 'finished' : 'lobby'
    });
  },

  addPlayer: (player: Player) => {
    set(state => ({
      players: [...state.players.filter(p => p.userId !== player.userId), player]
    }));
  },

  removePlayer: (userId: string) => {
    set(state => ({
      players: state.players.filter(p => p.userId !== userId)
    }));
  },

  updatePlayer: (userId: string, updates: Partial<Player>) => {
    set(state => ({
      players: state.players.map(p => 
        p.userId === userId ? { ...p, ...updates } : p
      )
    }));
  },

  addChatMessage: (message: ChatMessage) => {
    set(state => ({
      chatMessages: [...state.chatMessages, message]
    }));
  },

  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => {
    set({ connectionStatus: status });
  },

  setGameState: (state: 'lobby' | 'playing' | 'finished') => {
    set({ gameState: state });
  },

  setCurrentQuestion: (question: any) => {
    set({ currentQuestion: question });
  },

  setTimer: (time: number) => {
    set({ timer: time });
  },

  clearRoom: () => {
    set({
      currentRoom: null,
      isHost: false,
      players: [],
      chatMessages: [],
      connectionStatus: 'disconnected',
      gameState: 'lobby',
      currentQuestion: null,
      timer: 0
    });
  }
}));

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Clock, Power, Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { joinOrReconnectRoom, getRoom, leaveRoom, GameSession, setReady, startGame } from '@/lib/games-api';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GameSocketClient } from '@/lib/socket-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ReconnectOverlay } from '@/components/reconnect-overlay';
import { GameplayScreen } from '@/components/gameplay-screen';
import { GameResults } from '@/components/game-results';

const mockPlayers = [
    { name: 'QuizMaster', score: 120, avatar: 'https://picsum.photos/40/40?random=1', isHost: true, isReady: true, connectionStatus: 'connected' as const },
    { name: 'TriviaFan', score: 95, avatar: 'https://picsum.photos/40/40?random=2', isHost: false, isReady: true, connectionStatus: 'connected' as const },
    { name: 'GeekGod', score: 80, avatar: 'https://picsum.photos/40/40?random=3', isHost: false, isReady: false, connectionStatus: 'connected' as const },
    { name: 'FactChecker', score: 75, avatar: 'https://picsum.photos/40/40?random=4', isHost: false, isReady: true, connectionStatus: 'connected' as const },
];

export default function QuizRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomCode } = React.use(params);
  const { status } = useAuth();
  const { toast } = useToast();
  const [joining, setJoining] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<GameSession | null>(null);
  const [socketState, setSocketState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showReconnectOverlay, setShowReconnectOverlay] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Establish socket connection
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) {
      console.error('No API URL configured');
      return;
    }
    
    const client = new GameSocketClient(apiUrl, () => localStorage.getItem('accessToken'));
    setSocketState('connecting');
    
    try {
      const socket = client.connect();

    socket.on('connect', () => {
      setSocketState('connected');
      setShowReconnectOverlay(false);
      setIsReconnecting(false);
      toast({
        title: "Connected",
        description: "Successfully connected to the game server",
        variant: "success",
      });
      // Join room after successful connection
      client.joinRoom(roomCode);
    });
    
    socket.on('disconnect', () => {
      setSocketState('disconnected');
      setShowReconnectOverlay(true);
      toast({
        title: "Disconnected",
        description: "Lost connection to the game server",
        variant: "destructive",
      });
    });
    
    socket.on('message_received', (payload: any) => {
      setMessages((prev) => [{ id: crypto.randomUUID(), text: payload?.message || '' }, ...prev]);
    });

    socket.on('player_joined', (payload: any) => {
      setRoom((prev) => prev ? { ...prev, players: payload?.players ?? prev.players } : prev);
      toast({
        title: "Player Joined",
        description: `${payload?.player?.displayName || payload?.player?.username || 'A player'} joined the room`,
        variant: "info",
      });
    });
    
    socket.on('player_left', (payload: any) => {
      setRoom((prev) => prev ? { ...prev, players: payload?.players ?? prev.players } : prev);
      toast({
        title: "Player Left",
        description: `${payload?.player?.displayName || payload?.player?.username || 'A player'} left the room`,
        variant: "warning",
      });
    });
    
    socket.on('game_state', (gs: any) => {
      if (!gs) return;
      if (gs.players) setRoom((prev) => prev ? { ...prev, players: gs.players } : prev);
      if (typeof gs.currentQuestion === 'number') setQuestionIdx(gs.currentQuestion);
      if (typeof gs.totalQuestions === 'number') setTotalQuestions(gs.totalQuestions);
      
      // Update game state
      if (gs.status === 'in_progress') {
        setGameState('playing');
      } else if (gs.status === 'finished') {
        setGameState('finished');
      } else {
        setGameState('lobby');
      }
    });
    
    socket.on('question_delivered', (q: any) => {
      setCurrentQuestion(q);
      setQuestion(q?.text || '');
      setQuestionIdx(q?.index ?? 0);
      setTotalQuestions(q?.total ?? 0);
      setGameState('playing');
      
      const durationMs = q?.timePerQuestion ?? 30000;
      const endAt = Date.now() + durationMs;
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(Math.ceil(durationMs / 1000));
      timerRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        setTimer(left);
        if (left <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 250);
      
      toast({
        title: "New Question",
        description: `Question ${(q?.index ?? 0) + 1} of ${q?.total ?? 0}`,
        variant: "info",
      });
    });

    } catch (error) {
      console.error('Failed to establish socket connection:', error);
      setSocketState('disconnected');
      setShowReconnectOverlay(true);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Only disconnect if the component is actually unmounting
      // Don't disconnect on every re-render
      client.disconnect();
    };
  }, [status, roomCode, toast]);

  // Join or reconnect to room via REST to get room data
  useEffect(() => {
    let cancelled = false;

    const doJoinOrReconnect = async () => {
      setJoining(true);
      setError(null);
      try {
        const res = await joinOrReconnectRoom(roomCode);
        if (cancelled) return;
        setRoom(res.data.gameSession);
        localStorage.setItem('lastRoomCode', roomCode);
        
        // Show toast if this was a reconnection
        if (res.data.wasReconnected) {
          toast({
            title: "Reconnected",
            description: "Successfully reconnected to the room",
            variant: "success",
          });
        }
      } catch (e: any) {
        if (cancelled) return;
        const msg = e?.message || 'Failed to join room';
        if (/not found/i.test(msg)) setError('Room not found. Check the code and try again.');
        else if (/full|started/i.test(msg)) setError('Room is full or the game already started.');
        else if (/unauthorized|password/i.test(msg)) setError('Unauthorized to join this room.');
        else setError(msg);
      } finally {
        if (!cancelled) setJoining(false);
      }
    };

    doJoinOrReconnect();
    return () => { cancelled = true; };
  }, [roomCode, toast]);

  const players = useMemo(() => {
    if (room?.players?.length) {
      return room.players.map((p) => ({ 
        name: p.displayName || p.username, 
        score: p.score || 0, 
        avatar: `https://picsum.photos/40/40?random=${p.userId}`,
        isHost: p.isHost,
        isReady: p.isReady,
        connectionStatus: p.connectionStatus
      }));
    }
    return mockPlayers;
  }, [room]);

  const handleToggleReady = async () => {
    try {
      const newReady = !isReady;
      setIsReady(newReady);
      await setReady(roomCode, newReady);
    } catch (e) {
      setIsReady((v) => !v); // revert
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom(roomCode);
      window.location.href = '/dashboard';
    } catch (e) {
      window.location.href = '/dashboard';
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame(roomCode);
      toast({
        title: "Game Started",
        description: "The game is now beginning!",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to start game",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = (answerIndex: number) => {
    // This would emit the answer to the server via socket
    // For now, just show a toast
    toast({
      title: "Answer Submitted",
      description: "Your answer has been recorded",
      variant: "info",
    });
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "Question time has expired",
      variant: "warning",
    });
  };

  const handleReconnect = () => {
    setIsReconnecting(true);
    // Attempt to reconnect
    setTimeout(() => {
      setIsReconnecting(false);
      setShowReconnectOverlay(false);
    }, 2000);
  };

  const handleReplay = () => {
    setGameState('lobby');
    toast({
      title: "Replay",
      description: "Starting a new game...",
      variant: "info",
    });
  };

  const handleBackToLobby = () => {
    setGameState('lobby');
    toast({
      title: "Back to Lobby",
      description: "Returned to the game lobby",
      variant: "info",
    });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [{ id: crypto.randomUUID(), text: chatInput }, ...prev]);
    setChatInput('');
  };

  if (joining) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card>
          <CardContent className="p-6">Joining room {roomCode}…</CardContent>
        </Card>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-md mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Could not join room</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="secondary" asChild className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different screens based on game state
  if (gameState === 'finished') {
    const mockResults = players.map((p, index) => ({
      userId: p.name,
      username: p.name,
      displayName: p.name,
      score: p.score,
      rank: index + 1,
      correctAnswers: Math.floor(Math.random() * 10) + 1,
      totalQuestions: 10,
      averageResponseTime: Math.floor(Math.random() * 10) + 5,
    }));

    return (
      <GameResults
        players={mockResults}
        gameStats={{
          totalQuestions: totalQuestions || 10,
          gameDuration: 300, // Mock duration
          category: "General Knowledge",
          difficulty: "Medium",
        }}
        onReplay={handleReplay}
        onBackToLobby={handleBackToLobby}
      />
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    const gameplayPlayers = players.map((p, index) => ({
      userId: p.name,
      username: p.name,
      displayName: p.name,
      score: p.score,
      rank: index + 1,
      isHost: p.isHost,
      avatar: p.avatar,
    }));

    return (
      <GameplayScreen
        question={{
          id: currentQuestion.id || '1',
          text: currentQuestion.text || question || '',
          options: currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: currentQuestion.correctAnswer || 0,
          category: currentQuestion.category || 'General',
          difficulty: currentQuestion.difficulty || 'Medium',
        }}
        timePerQuestion={room?.gameConfiguration?.timePerQuestion || 30000}
        currentQuestionIndex={questionIdx}
        totalQuestions={totalQuestions}
        players={gameplayPlayers}
        onAnswerSubmit={handleAnswerSubmit}
        onTimeUp={handleTimeUp}
      />
    );
  }

  // Lobby view
  return (
    <>
      <ReconnectOverlay
        isVisible={showReconnectOverlay}
        connectionState={socketState}
        onReconnect={handleReconnect}
        isReconnecting={isReconnecting}
      />
      
      <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline">Lobby • {room?.roomCode || roomCode}</CardTitle>
                  <CardDescription>Connection: {socketState}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" onClick={handleStartGame}>
                    <Play className="w-4 h-4 mr-2" /> Start Game
                  </Button>
                  <Button variant={isReady ? 'default' : 'outline'} onClick={handleToggleReady}>
                    {isReady ? 'Ready ✅' : 'Ready?'}
                  </Button>
                  <Button variant="destructive" onClick={handleLeave}>
                    <Power className="w-4 h-4 mr-2" /> Leave
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div key={player.name} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{player.name.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          {player.name}
                          {player.isHost && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Host</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {player.connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm">{player.score}</span>
                      {player.isReady && (
                        <span className="text-xs text-green-600">Ready ✅</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className='font-headline'>Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full pr-4">
                <div className="space-y-4 text-sm">
                  {messages.map((m) => (
                    <p key={m.id}>{m.text}</p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center space-x-2">
                <Input type="text" placeholder="Send a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                <Button type="button" variant="secondary" size="icon" onClick={() => sendChat()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

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
import { smartJoinRoom, leaveRoom, GameSession, setReady, startGame } from '@/lib/games-api';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GameSocketClient } from '@/lib/socket-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ReconnectOverlay } from '@/components/reconnect-overlay';
import { GameplayScreen } from '@/components/gameplay-screen';
import { GameResults } from '@/components/game-results';

const mockPlayers = [
    { name: 'QuizMaster', score: 120, avatar: 'https://picsum.photos/40/40?random=1', isHost: true, isReady: true, connectionStatus: 'connected' as const, userId: 'mock-1' },
    { name: 'TriviaFan', score: 95, avatar: 'https://picsum.photos/40/40?random=2', isHost: false, isReady: true, connectionStatus: 'connected' as const, userId: 'mock-2' },
    { name: 'GeekGod', score: 80, avatar: 'https://picsum.photos/40/40?random=3', isHost: false, isReady: false, connectionStatus: 'connected' as const, userId: 'mock-3' },
    { name: 'FactChecker', score: 75, avatar: 'https://picsum.photos/40/40?random=4', isHost: false, isReady: true, connectionStatus: 'connected' as const, userId: 'mock-4' },
];

export default function LobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = React.use(params);
  const { status } = useAuth();
  const { toast } = useToast();
  const [joining, setJoining] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<GameSession | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketClientRef = useRef<GameSocketClient | null>(null);

  // Establish socket connection
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) {
      console.error('No API URL configured');
      return;
    }
    
    const client = new GameSocketClient(apiUrl, () => localStorage.getItem('accessToken'));
    socketClientRef.current = client;
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
        setMessages((prev) => [{ 
          id: String(crypto.randomUUID?.() || `msg-${Date.now()}-${Math.random()}`), 
          text: payload?.message || '',
          userId: payload?.userId || '',
          username: payload?.username || 'Unknown',
          timestamp: payload?.timestamp || Date.now(),
          messageType: payload?.messageType || 'text'
        }, ...prev]);
      });

      // Typing indicators
      socket.on('user_typing_start', (payload: any) => {
        const username = payload?.username || 'Someone';
        setTypingUsers(prev => [...prev.filter(u => u !== username), username]);
      });

      socket.on('user_typing_stop', (payload: any) => {
        const username = payload?.username || 'Someone';
        setTypingUsers(prev => prev.filter(u => u !== username));
      });

      // Enhanced error handling
      socket.on('connect_error', (error: any) => {
        console.log('Connection error:', error);
        toast({
          title: "Connection Lost",
          description: "Attempting to reconnect...",
          variant: "warning",
        });
      });

      socket.on('reconnect_error', (error: any) => {
        console.log('Reconnection error:', error);
        toast({
          title: "Reconnection Failed",
          description: "Will keep trying to reconnect...",
          variant: "destructive",
        });
      });

      socket.on('server_disconnect', (reason: any) => {
        console.log('Server disconnect:', reason);
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        // Redirect to login
        window.location.href = '/login';
      });

      socket.on('network_disconnect', (reason: any) => {
        console.log('Network disconnect:', reason);
        toast({
          title: "Connection Lost",
          description: "Reconnecting...",
          variant: "info",
        });
      });

      socket.on('player_joined', (payload: any) => {
        if (payload?.players && Array.isArray(payload.players)) {
          setRoom((prev) => prev ? { ...prev, players: payload.players } : prev);
        }
        toast({
          title: "Player Joined",
          description: `${payload?.player?.displayName || payload?.player?.username || 'A player'} joined the room`,
          variant: "info",
        });
      });
      
      socket.on('player_left', (payload: any) => {
        if (payload?.players && Array.isArray(payload.players)) {
          setRoom((prev) => prev ? { ...prev, players: payload.players } : prev);
        }
        toast({
          title: "Player Left",
          description: `${payload?.player?.displayName || payload?.player?.username || 'A player'} left the room`,
          variant: "warning",
        });
      });
      
      socket.on('game_state', (gs: any) => {
        if (!gs) return;
        if (gs.players && Array.isArray(gs.players)) {
          setRoom((prev) => prev ? { ...prev, players: gs.players } : prev);
        }
        if (typeof gs.currentQuestion === 'number') setQuestionIdx(Number(gs.currentQuestion) || 0);
        if (typeof gs.totalQuestions === 'number') setTotalQuestions(Number(gs.totalQuestions) || 0);
        
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
        setQuestionIdx(Number(q?.index) || 0);
        setTotalQuestions(Number(q?.total) || 0);
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
          description: `Question ${(Number(q?.index) || 0) + 1} of ${Number(q?.total) || 0}`,
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
      // Guard disconnect to avoid races during fast refresh/hot reload
      try {
        client.disconnect();
      } catch {}
    };
  }, [status, roomCode, toast]);

  // Load room data using smart join
  useEffect(() => {
    let cancelled = false;

    const loadRoomData = async () => {
      setJoining(true);
      setError(null);
      try {
        // Use smart join - it handles all cases
        const result = await smartJoinRoom(roomCode, { isHost: false });
        
        if (cancelled) return;
        
        if (result.success) {
          setRoom(result.data.gameSession);
          setIsHost(result.data.isHost);
          localStorage.setItem('lastRoomCode', roomCode);
          
          if (result.data.alreadyInRoom) {
            console.log('Already in room');
            toast({
              title: "Welcome Back",
              description: "You're already in this room",
              variant: "info",
            });
          } else {
            console.log('Joined room');
            toast({
              title: "Joined Room",
              description: "Successfully joined the room",
              variant: "success",
            });
          }
        }
      } catch (e: any) {
        if (cancelled) return;
        const msg = e?.message || 'Failed to load room';
        if (/not found/i.test(msg)) setError('Room not found. Check the code and try again.');
        else if (/full|started/i.test(msg)) setError('Room is full or the game already started.');
        else if (/unauthorized|password/i.test(msg)) setError('Unauthorized to join this room.');
        else setError(msg);
      } finally {
        if (!cancelled) setJoining(false);
      }
    };

    loadRoomData();
    return () => { cancelled = true; };
  }, [roomCode, toast]);

  const players = useMemo(() => {
    if (room?.players?.length) {
      return room.players.map((p, index) => ({ 
        name: p.displayName || p.username || `Player ${index + 1}`, 
        score: p.score || 0, 
        avatar: `https://picsum.photos/40/40?random=${String(p.userId?.toString?.() || p.userId || index)}`,
        isHost: p.isHost || false,
        isReady: p.isReady || false,
        connectionStatus: p.connectionStatus || 'connected',
        userId: String(p.userId?.toString?.() || p.userId || `player-${index}`)
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
    
    // Send via socket
    if (socketClientRef.current) {
      socketClientRef.current.sendChat(chatInput, 'text');
    }
    
    setChatInput('');
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChatInput(value);
    
    // Handle typing indicators
    if (socketClientRef.current) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        socketClientRef.current.startTyping();
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false);
        socketClientRef.current.stopTyping();
      }
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendChat();
      // Stop typing when message is sent
      if (isTyping && socketClientRef.current) {
        setIsTyping(false);
        socketClientRef.current.stopTyping();
      }
    }
  };

  if (joining) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card>
          <CardContent className="p-6">Loading room {roomCode}…</CardContent>
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
    const mockResults = players.map((p, index) => {
      const result = {
        userId: String(p.userId?.toString?.() || p.userId || `player-${index}`),
        username: String(p.name || `player-${index}`),
        displayName: String(p.name || `Player ${index + 1}`),
        score: Number(p.score || 0),
        rank: Number(index + 1),
        correctAnswers: Number(Math.floor(Math.random() * 10) + 1),
        totalQuestions: Number(10),
        averageResponseTime: Number(Math.floor(Math.random() * 10) + 5),
        points: Number(p.score || 0), // Add points field
        streakCount: Number(Math.floor(Math.random() * 5) + 1), // Add streakCount field
      };
      return result;
    });

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
      userId: String(p.userId?.toString?.() || p.userId || `player-${index}`),
      username: String(p.name || `player-${index}`),
      displayName: String(p.name || `Player ${index + 1}`),
      score: Number(p.score || 0),
      rank: Number(index + 1),
      isHost: Boolean(p.isHost),
      avatar: String(p.avatar),
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
                  {isHost && (
                    <Button variant="default" onClick={handleStartGame}>
                      <Play className="w-4 h-4 mr-2" /> Start Game
                    </Button>
                  )}
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
                 {players.map((player, index) => (
                   <div key={`player-${String(player.userId?.toString?.() || player.userId || index)}-${index}`} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{String(player.name || 'U').substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          {String(player.name || 'Unknown Player')}
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
                      <span className="font-mono text-sm">{String(Number(player.score || 0) || 0)}</span>
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
                  {messages.map((m, index) => (
                    <p key={`message-${String(m.id?.toString?.() || m.id || index)}-${index}`}>{m.text}</p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col space-y-2">
                {typingUsers.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
                <div className="flex w-full items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Send a message..." 
                    value={chatInput} 
                    onChange={handleChatInputChange}
                    onKeyPress={handleChatKeyPress}
                  />
                  <Button type="button" variant="secondary" size="icon" onClick={sendChat}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

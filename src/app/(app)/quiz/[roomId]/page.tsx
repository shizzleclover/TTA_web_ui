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
import { joinRoom, getRoom, leaveRoom, Room, setReady, startGame } from '@/lib/games-api';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GameSocketClient } from '@/lib/socket-client';
import { useAuth } from '@/hooks/use-auth';

const mockPlayers = [
    { name: 'QuizMaster', score: 120, avatar: 'https://picsum.photos/40/40?random=1' },
    { name: 'TriviaFan', score: 95, avatar: 'https://picsum.photos/40/40?random=2' },
    { name: 'GeekGod', score: 80, avatar: 'https://picsum.photos/40/40?random=3' },
    { name: 'FactChecker', score: 75, avatar: 'https://picsum.photos/40/40?random=4' },
];

export default function QuizRoomPage({ params }: { params: { roomId: string } }) {
  const roomCode = params.roomId;
  const { status } = useAuth();
  const [joining, setJoining] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [socketState, setSocketState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Establish socket connection
  useEffect(() => {
    if (status !== 'authenticated') return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const client = new GameSocketClient(apiUrl, () => localStorage.getItem('accessToken'));
    setSocketState('connecting');
    const socket = client.connect();

    socket.on('connect', () => setSocketState('connected'));
    socket.on('disconnect', () => setSocketState('disconnected'));
    socket.on('message_received', (payload: any) => {
      setMessages((prev) => [{ id: crypto.randomUUID(), text: payload?.message || '' }, ...prev]);
    });

    socket.on('player_joined', (payload: any) => {
      setRoom((prev) => prev ? { ...prev, players: payload?.players ?? prev.players } : prev);
    });
    socket.on('player_left', (payload: any) => {
      setRoom((prev) => prev ? { ...prev, players: payload?.players ?? prev.players } : prev);
    });
    socket.on('game_state', (gs: any) => {
      if (!gs) return;
      if (gs.players) setRoom((prev) => prev ? { ...prev, players: gs.players } : prev);
      if (typeof gs.currentQuestion === 'number') setQuestionIdx(gs.currentQuestion);
      if (typeof gs.totalQuestions === 'number') setTotalQuestions(gs.totalQuestions);
    });
    socket.on('question_delivered', (q: any) => {
      setQuestion(q?.text || '');
      setQuestionIdx(q?.index ?? 0);
      setTotalQuestions(q?.total ?? 0);
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
    });

    // auto-join room channel if server expects it
    socket.on('connect', () => client.joinRoom(roomCode));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      client.disconnect();
    };
  }, [status, roomCode]);

  // Join via REST first to get room data
  useEffect(() => {
    let cancelled = false;

    const doJoin = async () => {
      setJoining(true);
      setError(null);
      try {
        const res = await joinRoom(roomCode);
        if (cancelled) return;
        setRoom(res.room);
        localStorage.setItem('lastRoomCode', roomCode);
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

    doJoin();
    return () => { cancelled = true; };
  }, [roomCode]);

  const players = useMemo(() => {
    if (room?.players?.length) {
      return room.players.map((p) => ({ name: p.username, score: p.score, avatar: `https://picsum.photos/40/40?random=${p.userId}` }));
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
    } catch (e) {
      // surface error later with toasts
    }
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

  const showGameplay = !!question; // switch when question_delivered arrives

  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline">{showGameplay ? 'Gameplay' : 'Lobby'} • {room?.roomCode || roomCode}</CardTitle>
                <CardDescription>Connection: {socketState}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!showGameplay && (
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
            {!showGameplay ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div key={player.name} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{player.name.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="font-mono text-sm">{player.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <Progress value={Math.max(0, Math.min(100, (timer / ((room?.gameConfiguration?.timePerQuestion || 30000) / 1000)) * 100))} className="h-3" />
                  <span className="text-sm font-mono">{timer}s</span>
                </div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                  {question}
                </p>
              </>
            )}
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
  );
}

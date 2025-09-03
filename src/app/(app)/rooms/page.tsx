'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { listRooms, RoomsListResponse } from '@/lib/games-api';
import { Users, RefreshCcw, Key } from 'lucide-react';

export default function RoomsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomsListResponse['rooms']>([]);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [privateRoomCode, setPrivateRoomCode] = useState<string>('');

  const loadRooms = async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRooms({ status: 'waiting', hasCapacity: true, limit, skip: reset ? 0 : skip });
      const roomsList = res?.rooms || [];
      setRooms(reset ? roomsList : [...rooms, ...roomsList]);
      setSkip((reset ? 0 : skip) + roomsList.length);
      setHasMore(roomsList.length === limit); // Simple pagination check
    } catch (e: any) {
      setError(e?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinPrivateRoom = () => {
    const trimmedCode = privateRoomCode.trim().toUpperCase();
    if (trimmedCode.length === 6) {
      router.push(`/lobby/${trimmedCode}`);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-headline font-bold">Available Rooms</h1>
        <Button variant="outline" size="sm" onClick={() => loadRooms(true)} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-4">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Private Room Join Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Key className="w-5 h-5" />
            Join Private Room
          </CardTitle>
          <CardDescription>
            Have a private room code? Enter it below to join directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter 6-character room code"
              value={privateRoomCode}
              onChange={(e) => setPrivateRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1"
            />
            <Button 
              onClick={handleJoinPrivateRoom}
              disabled={privateRoomCode.trim().length !== 6}
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {!loading && (rooms || []).length === 0 && !error && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No public rooms available right now.</p>
            <Button onClick={() => loadRooms(true)}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rooms || []).map((r) => (
          <Card key={r.roomCode}>
            <CardHeader>
              <CardTitle className="font-headline">
                {r.gameConfiguration.roomName || `Room ${r.roomCode}`}
              </CardTitle>
              <CardDescription>
                Status: {r.gameState.status} • {r.gameConfiguration.isPrivate ? '🔒 Private' : '🌐 Public'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {r.playerCount || 0} / {r.gameConfiguration?.maxPlayers || 0}
                </span>
              </div>
              <span>{r.gameConfiguration?.questionCount || 0} questions</span>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/lobby/${r.roomCode}`}>Join Room</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {hasMore && (
          <Button onClick={() => loadRooms()} disabled={loading}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

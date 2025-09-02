'use client';
import Link from 'next/link';
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
import { LogIn, Users } from 'lucide-react';
import Image from 'next/image';
import { CreateRoomForm } from '@/components/create-room-form';
import { useAuth } from '@/hooks/use-auth';

const publicRooms = [
  {
    id: 1,
    name: '80s Music Trivia',
    category: 'Music',
    players: 8,
    maxPlayers: 10,
    image: 'https://picsum.photos/400/200?random=1',
    imageHint: 'retro music',
  },
  {
    id: 2,
    name: 'World Capitals Challenge',
    category: 'Geography',
    players: 5,
    maxPlayers: 15,
    image: 'https://picsum.photos/400/200?random=2',
    imageHint: 'world map',
  },
  {
    id: 3,
    name: 'Sci-Fi Movie Buffs',
    category: 'Movies',
    players: 12,
    maxPlayers: 20,
    image: 'https://picsum.photos/400/200?random=3',
    imageHint: 'space ship',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Welcome, {user?.username || 'QuizMaster'}!
        </h1>
        <p className="text-muted-foreground">Ready for your next challenge?</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Start a New Quiz</CardTitle>
            <CardDescription>
              Create your own room and invite friends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateRoomForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Join a Room</CardTitle>
            <CardDescription>
              Enter a room code to join a quiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Enter room code..." />
              <Button type="submit" variant="secondary">
                <LogIn className="w-4 h-4 mr-2" />
                Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold font-headline mb-4">
          Public Rooms
        </h2>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {publicRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
               <Image
                  alt={room.name}
                  className="h-48 w-full object-cover"
                  height="200"
                  src={room.image}
                  data-ai-hint={room.imageHint}
                  width="400"
                />
              <CardHeader>
                <CardTitle className='font-headline'>{room.name}</CardTitle>
                <CardDescription>{room.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {room.players} / {room.maxPlayers}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" asChild>
                    <Link href={`/quiz/${room.id}`}>Join Room</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

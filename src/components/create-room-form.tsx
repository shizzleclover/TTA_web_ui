'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { createRoom } from '@/lib/games-api';
import { useRouter } from 'next/navigation';

const VALID_CATEGORIES = ['geography','history','science','sports','entertainment','general'] as const;
const VALID_DIFFICULTY = ['easy','medium','hard','expert'] as const;

type Category = typeof VALID_CATEGORIES[number];
type Difficulty = typeof VALID_DIFFICULTY[number];

export function CreateRoomForm() {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState(10);
  const [category, setCategory] = useState<Category>('general');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeSec, setTimeSec] = useState(15);
  const [roomName, setRoomName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [allowSpectators, setAllowSpectators] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createRoom({
        gameConfiguration: {
          maxPlayers: 4,
          questionCount: questions,
          timePerQuestion: timeSec, // seconds
          categories: [category],
          difficultyRange: [difficulty, 'medium'],
          isPrivate,
          allowSpectators,
          roomName: roomName.trim() || undefined,
          password: isPrivate && password.trim() ? password.trim() : undefined,
        },
      });

      const roomCode = res.data?.roomCode;
      if (!roomCode) throw new Error('No room code returned');

      localStorage.setItem('lastRoomCode', roomCode);
      toast({ title: 'Room created', description: `Room code: ${roomCode}` });
      setOpen(false);
      router.push(`/lobby/${roomCode}`);
    } catch (e: any) {
      const msg = e?.message || 'Failed to create room';
      setError(msg);
      console.error('Create room error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Room</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='font-headline'>Create a New Quiz Room</DialogTitle>
            <DialogDescription>
              Set options and start a new quiz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomName" className="text-right">
                  Room Name
                </Label>
                <div className="col-span-3">
                  <Input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Marvel Movie Night" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Private Room
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="isPrivate"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="isPrivate">Require password to join</Label>
                </div>
              </div>
              {isPrivate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <div className="col-span-3">
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter room password" 
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Allow Spectators
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="allowSpectators"
                    checked={allowSpectators}
                    onCheckedChange={setAllowSpectators}
                  />
                  <Label htmlFor="allowSpectators">Let users watch without playing</Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Difficulty
                </Label>
                <div className="col-span-3">
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_DIFFICULTY.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numberOfQuestions" className="text-right">
                  Questions
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-4">
                    <Slider
                      id="numberOfQuestions"
                      min={5}
                      max={50}
                      step={1}
                      value={[questions]}
                      onValueChange={(value) => setQuestions(value[0])}
                    />
                    <span className="font-mono text-sm w-12 text-center">{questions}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Time / Q (s)
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-4">
                    <Slider
                      min={5}
                      max={60}
                      step={5}
                      value={[timeSec]}
                      onValueChange={(value) => setTimeSec(value[0])}
                    />
                    <span className="font-mono text-sm w-12 text-center">{timeSec}</span>
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive -mt-2 mb-2">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
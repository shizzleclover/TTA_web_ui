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
import { Send, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const players = [
    { name: 'QuizMaster', score: 120, avatar: 'https://picsum.photos/40/40?random=1' },
    { name: 'TriviaFan', score: 95, avatar: 'https://picsum.photos/40/40?random=2' },
    { name: 'GeekGod', score: 80, avatar: 'https://picsum.photos/40/40?random=3' },
    { name: 'FactChecker', score: 75, avatar: 'https://picsum.photos/40/40?random=4' },
];

export default function QuizRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">80s Music Trivia</CardTitle>
            <CardDescription>Question 5 of 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <Progress value={40} className="h-3" />
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              Which artist released the hit song "Billie Jean" in 1982?
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Type your answer here..." />
              <Button type="submit">
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className='font-headline'>Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.sort((a,b) => b.score - a.score).map((player) => (
                  <TableRow key={player.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6">
                            <AvatarImage src={player.avatar} data-ai-hint="user avatar" />
                            <AvatarFallback>{player.name.substring(0,1)}</AvatarFallback>
                         </Avatar>
                         <span>{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className='font-headline'>Chat</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 w-full pr-4">
                    <div className="space-y-4 text-sm">
                        <p><span className="font-semibold text-primary">TriviaFan:</span> Good luck everyone!</p>
                        <p><span className="font-semibold text-blue-500">GeekGod:</span> You too!</p>
                        <p><span className="font-semibold text-primary">TriviaFan:</span> This is a tough one.</p>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                 <div className="flex w-full items-center space-x-2">
                    <Input type="text" placeholder="Send a message..." />
                    <Button type="submit" variant="secondary" size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

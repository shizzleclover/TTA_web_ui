import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const leaderboardData = [
  { rank: 1, name: 'TriviaMaster', points: 12580, games: 150 },
  { rank: 2, name: 'QuizWhiz', points: 11920, games: 142 },
  { rank: 3, name: 'Brainiac', points: 11500, games: 135 },
  { rank: 4, name: 'FactFiend', points: 10850, games: 128 },
  { rank: 5, name: 'KnowItAll', points: 10200, games: 120 },
  { rank: 6, name: 'SmartyPants', points: 9800, games: 115 },
  { rank: 7, name: 'Puzzler', points: 9500, games: 110 },
  { rank: 8, name: 'Genius', points: 9200, games: 105 },
  { rank: 9, name: 'Egghead', points: 8900, games: 100 },
  { rank: 10, name: 'Prodigy', points: 8600, games: 95 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400" />;
  return <span className="font-mono text-sm">{rank}</span>;
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-3 sm:px-0">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl">Global Leaderboard</CardTitle>
          <CardDescription>See how you stack up against the best players in the world.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile list (no horizontal scroll) */}
          <div className="block sm:hidden">
            <div className="divide-y">
              {leaderboardData.map((player) => (
                <div key={player.rank} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 text-center flex-shrink-0">
                      <RankBadge rank={player.rank} />
                    </div>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={`https://picsum.photos/40/40?random=${player.rank}`} data-ai-hint="user avatar"/>
                      <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{player.games} games</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{player.points.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Total Points</TableHead>
                  <TableHead className="text-right">Games Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player) => (
                  <TableRow key={player.rank}>
                    <TableCell className="font-medium text-center">
                      <div className="flex justify-center items-center">
                        <RankBadge rank={player.rank} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/40/40?random=${player.rank}`} data-ai-hint="user avatar"/>
                          <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.points.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{player.games}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

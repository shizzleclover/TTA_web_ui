'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Target, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface PlayerResult {
  userId: string;
  username: string;
  displayName?: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;
  points?: number;
  streakCount?: number;
}

interface GameResultsProps {
  players: PlayerResult[];
  gameStats: {
    totalQuestions: number;
    gameDuration: number;
    category: string;
    difficulty: string;
  };
  onReplay: () => void;
  onBackToLobby: () => void;
}

export function GameResults({ 
  players, 
  gameStats, 
  onReplay, 
  onBackToLobby 
}: GameResultsProps) {
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
  const winner = sortedPlayers[0];
  const currentUser = sortedPlayers.find(p => p.userId === 'current-user-id'); // Replace with actual user ID

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Winner Announcement */}
      <Card className="text-center border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl text-yellow-800">
            🎉 {winner?.displayName || winner?.username} Wins! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Congratulations to our champion!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Game Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatTime(gameStats.gameDuration)}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.category}</div>
              <div className="text-sm text-muted-foreground">Category</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.difficulty}</div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Final Rankings</CardTitle>
          <CardDescription>How everyone performed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.userId}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  index === 0
                    ? 'border-yellow-300 bg-yellow-50'
                    : index === 1
                    ? 'border-gray-300 bg-gray-50'
                    : index === 2
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://picsum.photos/40/40?random=${player.userId}`} />
                      <AvatarFallback>
                        {(player.displayName || player.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {player.displayName || player.username}
                        {player.userId === currentUser?.userId && (
                          <span className="ml-2 text-sm text-muted-foreground">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.correctAnswers || 0}/{player.totalQuestions || 0} correct
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{player.score || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {typeof player.averageResponseTime === 'number' ? player.averageResponseTime.toFixed(1) : '0.0'}s avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReplay} className="flex-1" size="lg">
              <Target className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={onBackToLobby} variant="outline" className="flex-1" size="lg">
              <Clock className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
            <Button asChild variant="secondary" className="flex-1" size="lg">
              <Link href="/dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

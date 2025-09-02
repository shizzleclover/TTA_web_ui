'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Trophy,
  Gamepad2,
  Star,
  Percent,
  TrendingUp,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

const chartData = [
  { month: 'January', points: 1860 },
  { month: 'February', points: 3050 },
  { month: 'March', points: 2370 },
  { month: 'April', points: 730 },
  { month: 'May', points: 2090 },
  { month: 'June', points: 2140 },
];

const chartConfig = {
  points: {
    label: 'Points',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type LifetimeStats = {
  gamesPlayed: number;
  gamesWon: number;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number;
  winStreak: number;
  longestWinStreak: number;
};

type UserProfileResponse = {
  _id: string;
  username?: string;
  email?: string;
  profile?: {
    displayName?: string;
    joinedAt?: string;
    lastLogin?: string;
    isActive?: boolean;
    isAdmin?: boolean;
  };
  statistics?: {
    lifetime?: Partial<LifetimeStats>;
  };
  achievements?: Array<{
    type: string;
    unlockedAt: string;
    value: number;
  }>;
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;

      const initializeAndFetch = async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            api.setToken(token);
          }
          const res = await api.get<UserProfileResponse | { data: UserProfileResponse }>(
            '/api/auth/me'
          );
          const data = (res as any)?.data ?? res;
          if (isMounted) {
            setProfile(data as UserProfileResponse);
            setError(null);
          }
        } catch (e: any) {
          if (isMounted) {
            setError(e?.message || 'Failed to load profile');
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      initializeAndFetch();

      return () => {
        isMounted = false;
      };
    }, []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">Loading profile…</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            We couldn't load your profile right now.
            <div className="mt-4">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lifetimeRaw = (profile.statistics?.lifetime || {}) as Partial<LifetimeStats>;
  const lifetime: LifetimeStats = {
    gamesPlayed: lifetimeRaw.gamesPlayed ?? 0,
    gamesWon: lifetimeRaw.gamesWon ?? 0,
    totalQuestions: lifetimeRaw.totalQuestions ?? 0,
    correctAnswers: lifetimeRaw.correctAnswers ?? 0,
    averageResponseTime: lifetimeRaw.averageResponseTime ?? 0,
    winStreak: lifetimeRaw.winStreak ?? 0,
    longestWinStreak: lifetimeRaw.longestWinStreak ?? 0,
  };

  const baseName = profile.profile?.displayName || profile.username || 'Your Profile';
  const displayName = baseName;
  const email = profile.email || '-';
  const initialsSource = profile.username || profile.profile?.displayName || 'U';
  const initials = (initialsSource || 'U').substring(0, 2).toUpperCase();
  const avatarSeed = profile._id || initialsSource || 'user';

  const winRate = (!lifetime.gamesPlayed)
    ? 0
    : Math.round(((lifetime.gamesWon || 0) / lifetime.gamesPlayed) * 100);

  const hasAnyStat = (
    lifetime.gamesPlayed > 0 ||
    lifetime.gamesWon > 0 ||
    lifetime.totalQuestions > 0 ||
    lifetime.correctAnswers > 0 ||
    lifetime.longestWinStreak > 0
  );

  const stats = [
    { name: 'Games Played', value: String(lifetime.gamesPlayed), icon: Gamepad2 },
    { name: 'Games Won', value: String(lifetime.gamesWon), icon: Trophy },
    { name: 'Total Questions', value: String(lifetime.totalQuestions), icon: BookOpen },
    { name: 'Correct Answers', value: String(lifetime.correctAnswers), icon: Star },
    { name: 'Win Rate', value: `${winRate}%`, icon: Percent },
    { name: 'Longest Streak', value: String(lifetime.longestWinStreak), icon: TrendingUp },
  ];
  
  return (
    <div className="container mx-auto px-3 sm:px-0">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage
              src={`https://picsum.photos/seed/${avatarSeed}/100/100`}
              data-ai-hint="user avatar"
              alt="User Avatar"
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{displayName}</h1>
            <p className="text-muted-foreground">{email}</p>
          </div>
          <Button variant="outline" className="md:ml-auto">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold font-headline mb-4">
            Lifetime Statistics
          </h2>

          {!hasAnyStat ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  You don't have any stats yet. Play your first game to start tracking your progress!
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild>
                    <Link href="/play">Play Now</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/categories">Browse Categories</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.name}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Performance
                  </CardTitle>
                  <CardDescription>
                    Your total points over the last 6 months.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                          dataKey="month"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="points"
                          fill="var(--color-points)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold font-headline mb-4">
            Achievements
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {profile.achievements?.length ? (
                  profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{achievement.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {achievement.value}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(achievement.unlockedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">No achievements yet.</p>
                    <div className="mt-4">
                      <Button asChild>
                        <Link href="/play">Play your first game</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

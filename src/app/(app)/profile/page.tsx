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

const stats = [
  { name: 'Total Points', value: '1,250,890', icon: Trophy },
  { name: 'Games Played', value: '150', icon: Gamepad2 },
  { name: 'Average Score', value: '8,339', icon: Star },
  { name: 'Win Rate', value: '72%', icon: Percent },
];

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

const recentActivities = [
  {
    icon: Trophy,
    title: 'New High Score!',
    description: 'Scored 12,500 points in 80s Music Trivia.',
    timestamp: '2 hours ago',
  },
  {
    icon: Gamepad2,
    title: 'Joined "World Capitals"',
    description: 'Finished 3rd with 9,800 points.',
    timestamp: '1 day ago',
  },
  {
    icon: BookOpen,
    title: 'Mastered "Science"',
    description: 'Answered all questions correctly in the Science category.',
    timestamp: '3 days ago',
  },
];

export default function ProfilePage() {
    const { user } = useAuth();

  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage
              src={`https://picsum.photos/seed/${user.id}/100/100`}
              data-ai-hint="user avatar"
              alt="User Avatar"
            />
            <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
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
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold font-headline mb-4">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

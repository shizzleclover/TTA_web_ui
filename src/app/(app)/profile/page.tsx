import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trophy, Gamepad2, Star, Percent } from 'lucide-react';

const stats = [
    { name: 'Total Points', value: '1,250,890', icon: Trophy },
    { name: 'Games Played', value: '150', icon: Gamepad2 },
    { name: 'Average Score', value: '8,339', icon: Star },
    { name: 'Win Rate', value: '72%', icon: Percent },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="user avatar" alt="User Avatar" />
            <AvatarFallback>QM</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">QuizMaster</h1>
            <p className="text-muted-foreground">quizmaster@example.com</p>
          </div>
          <Button variant="outline" className="md:ml-auto">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">
          Lifetime Statistics
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       <div className="mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">
          Recent Activity
        </h2>
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground">No recent activity to display.</p>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}

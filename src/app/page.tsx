import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="font-headline">Text the Answer</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-6">
              The Ultimate Real-Time Quiz Show
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Create rooms, challenge your friends, and climb the leaderboards. Test your knowledge in a fast-paced, real-time trivia showdown.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold font-headline">Features</h3>
              <p className="text-muted-foreground mt-2">Everything you need to host the perfect quiz night.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline">Real-time Gameplay</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Experience the thrill of live quiz action with instant scoring and dynamic question delivery.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline">Custom Rooms & Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create private quiz rooms for your friends, customize the rules, and chat in real-time.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline">Leaderboards & Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Track your progress, view detailed stats, and compete for the top spot on the global leaderboards.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Text the Answer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

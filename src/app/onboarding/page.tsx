import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, Users, Trophy } from 'lucide-react';

const onboardingSteps = [
  {
    icon: Gamepad2,
    title: 'Real-time Gameplay',
    description: 'Experience the thrill of live quiz action with instant scoring and dynamic question delivery.',
    image: 'https://picsum.photos/600/400?random=10',
    imageHint: 'game controller console',
  },
  {
    icon: Users,
    title: 'Custom Rooms & Chat',
    description: 'Create private quiz rooms for your friends, customize the rules, and chat in real-time.',
    image: 'https://picsum.photos/600/400?random=11',
    imageHint: 'friends chatting',
  },
  {
    icon: Trophy,
    title: 'Leaderboards & Stats',
    description: 'Track your progress, view detailed stats, and compete for the top spot on the global leaderboards.',
    image: 'https://picsum.photos/600/400?random=12',
    imageHint: 'trophy award',
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/50 p-4">
        <div className="w-full max-w-2xl text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter">
                Welcome to Text the Answer!
            </h1>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
                Get ready for the ultimate real-time quiz show. Here's a quick tour of what you can do.
            </p>
        </div>
      <Carousel className="w-full max-w-xl">
        <CarouselContent>
          {onboardingSteps.map((step, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-6 text-center">
                    <Image
                        src={step.image}
                        alt={step.title}
                        width={600}
                        height={400}
                        data-ai-hint={step.imageHint}
                        className="rounded-lg object-cover w-full h-64"
                    />
                    <div className="bg-primary/10 text-primary rounded-lg w-14 h-14 flex items-center justify-center">
                        <step.icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-headline">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
       <div className="mt-8">
            <Button size="lg" asChild>
                <Link href="/login">Let's Get Started!</Link>
            </Button>
       </div>
    </div>
  );
}

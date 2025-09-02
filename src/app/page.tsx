import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse">
        <Gamepad2 className="h-24 w-24 text-primary" />
      </div>
      <p className="mt-4 text-lg text-muted-foreground">Loading your quiz experience...</p>
      {/* This is a simple splash screen. In a real app, you might have a useEffect to navigate after a delay. */}
      <div className="absolute bottom-8">
        <Link href="/onboarding" className="text-sm text-primary hover:underline">
          Proceed to Onboarding
        </Link>
      </div>
    </div>
  );
}
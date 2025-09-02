'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { AppSidebar } from '@/components/sidebar';
import { useAuth } from '@/hooks/use-auth';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
     <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 bg-background pb-24 md:pb-8">
          {children}
        </main>
      </div>
       <BottomNav />
    </div>
  );
}

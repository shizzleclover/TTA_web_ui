import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-secondary/50 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

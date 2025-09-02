'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, User, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rooms', label: 'Rooms', icon: List },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex justify-around h-16 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-md text-muted-foreground transition-colors hover:text-primary',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

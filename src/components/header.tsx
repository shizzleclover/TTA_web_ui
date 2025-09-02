'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Gamepad2,
  LayoutDashboard,
  Trophy,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-16 items-center">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Text the Answer</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                pathname === item.href && 'text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="user avatar" alt="User Avatar" />
                  <AvatarFallback>QM</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">QuizMaster</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    quizmaster@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                 </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

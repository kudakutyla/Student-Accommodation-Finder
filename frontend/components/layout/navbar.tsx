'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/link-button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/format';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
];

function dashboardPathFor(role: string) {
  if (role === 'STUDENT') return '/student/dashboard';
  if (role === 'LANDLORD') return '/landlord/dashboard';
  return '/admin/dashboard';
}

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </span>
          Nestly<span className="text-primary">Campus</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isLoading && !user && (
            <>
              <LinkButton variant="ghost" href="/login">Log in</LinkButton>
              <LinkButton href="/register?role=LANDLORD">List Your Property</LinkButton>
              <LinkButton variant="outline" href="/register">Sign up</LinkButton>
            </>
          )}
          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1 pr-3 hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.firstName}</span>
                  </button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(dashboardPathFor(user.role))}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>} />
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
                  {link.label}
                </Link>
              ))}
              <DropdownMenuSeparator />
              {!user && (
                <>
                  <Link href="/login" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">Log in</Link>
                  <Link href="/register" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">Sign up</Link>
                  <Link href="/register?role=LANDLORD" className="rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-muted">List Your Property</Link>
                </>
              )}
              {user && (
                <>
                  <Link href={dashboardPathFor(user.role)} className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">Dashboard</Link>
                  <button onClick={logout} className="rounded-md px-2 py-2 text-left text-sm font-medium text-destructive hover:bg-muted">Log out</button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

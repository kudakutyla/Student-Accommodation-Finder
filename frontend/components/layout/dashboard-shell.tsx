'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Home, LogOut, Menu } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { listNotificationsRequest } from '@/services/notification.service';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

function SidebarNav({ navItems, pathname }: { navItems: DashboardNavItem[]; pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  navItems,
  roleLabel,
  children,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    listNotificationsRequest()
      .then((res) => {
        if (mounted) setUnreadCount(res.data.filter((n) => !n.isRead).length);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const notificationsHref = `/${roleLabel.toLowerCase()}/notifications`;

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </span>
          NestlyCampus
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav navItems={navItems} pathname={pathname} />
        </div>
        <div className="border-t border-border p-4">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>NestlyCampus</SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col justify-between px-3 pb-4">
                  <SidebarNav navItems={navItems} pathname={pathname} />
                  <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold text-muted-foreground">{roleLabel} Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={notificationsHref} className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </Link>
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {initials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

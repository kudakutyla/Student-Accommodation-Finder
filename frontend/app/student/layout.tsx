'use client';

import { LayoutDashboard, Search, Heart, Mail, MessageCircle, Star, Bell, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardShell, DashboardNavItem } from '@/components/layout/dashboard-shell';

const NAV_ITEMS: DashboardNavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/search', label: 'Search', icon: Search },
  { href: '/student/favourites', label: 'Favourites', icon: Heart },
  { href: '/student/enquiries', label: 'Enquiries', icon: Mail },
  { href: '/student/messages', label: 'Messages', icon: MessageCircle },
  { href: '/student/reviews', label: 'My Reviews', icon: Star },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <DashboardShell navItems={NAV_ITEMS} roleLabel="Student">
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}

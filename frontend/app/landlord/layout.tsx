'use client';

import { LayoutDashboard, Building2, Mail, MessageCircle, Star, Bell, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardShell, DashboardNavItem } from '@/components/layout/dashboard-shell';

const NAV_ITEMS: DashboardNavItem[] = [
  { href: '/landlord/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/landlord/listings', label: 'My Listings', icon: Building2 },
  { href: '/landlord/enquiries', label: 'Enquiries', icon: Mail },
  { href: '/landlord/messages', label: 'Messages', icon: MessageCircle },
  { href: '/landlord/reviews', label: 'Reviews', icon: Star },
  { href: '/landlord/notifications', label: 'Notifications', icon: Bell },
  { href: '/landlord/profile', label: 'Profile', icon: User },
];

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['LANDLORD']}>
      <DashboardShell navItems={NAV_ITEMS} roleLabel="Landlord">
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}

'use client';

import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  School,
  Flag,
  Star,
  Bell,
  ScrollText,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardShell, DashboardNavItem } from '@/components/layout/dashboard-shell';

const NAV_ITEMS: DashboardNavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/landlords', label: 'Landlords', icon: Building2 },
  { href: '/admin/landlords/pending', label: 'Landlord Verification', icon: ShieldCheck },
  { href: '/admin/listings', label: 'Listings', icon: Building2 },
  { href: '/admin/listings/pending', label: 'Listing Approval', icon: ClipboardCheck },
  { href: '/admin/campuses', label: 'Campuses', icon: School },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardShell navItems={NAV_ITEMS} roleLabel="Admin">
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}

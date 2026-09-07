'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Building2, ShieldCheck, Clock, ClipboardList, ClipboardCheck, Flag, Activity } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminDashboardRequest, AdminDashboardStats } from '@/services/admin.service';
import { formatDateTime } from '@/lib/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardRequest()
      .then((res) => setStats(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading platform statistics..." />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader title="Platform Dashboard" description="An overview of NestlyCampus activity and moderation queues." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={stats.totalStudents} icon={GraduationCap} />
        <StatCard label="Total landlords" value={stats.totalLandlords} icon={Building2} />
        <StatCard label="Verified landlords" value={stats.verifiedLandlords} icon={ShieldCheck} tone="success" />
        <StatCard label="Pending verifications" value={stats.pendingLandlords} icon={Clock} tone="warning" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={stats.totalListings} icon={ClipboardList} />
        <StatCard label="Approved listings" value={stats.approvedListings} icon={ClipboardCheck} tone="success" />
        <StatCard label="Pending approvals" value={stats.pendingListings} icon={Clock} tone="warning" />
        <StatCard label="Reports needing attention" value={stats.pendingReports} icon={Flag} tone="danger" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Recent activity</h2>
        </div>
        {stats.recentActivity.length === 0 ? (
          <EmptyState title="No recent activity" />
        ) : (
          <div className="space-y-2">
            {stats.recentActivity.map((log) => (
              <Card key={log.id}>
                <CardContent className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'} &middot; {log.entityType}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

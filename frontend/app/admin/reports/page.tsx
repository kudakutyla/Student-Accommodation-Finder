'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listAdminReportsRequest, resolveReportRequest } from '@/services/admin.service';
import { Report } from '@/types';
import { formatDateTime, reportReasonLabel } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading flag before a new fetch on filter change
    setIsLoading(true);
    listAdminReportsRequest(statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => setReports(res.data))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  async function handleResolve(id: string, status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING') {
    try {
      await resolveReportRequest(id, status);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Report marked as ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update report.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review reports submitted by students about listings."
        action={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState icon={<Flag className="h-8 w-8" />} title="No reports found" />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/listings/${report.listingId}`} className="font-medium text-foreground hover:underline">
                      {report.listing?.title}
                    </Link>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reason: {reportReasonLabel(report.reason)} &middot; Reported by {report.reporter?.firstName} {report.reporter?.lastName}
                  </p>
                  {report.description && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{report.description}&rdquo;</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(report.createdAt)}</p>
                </div>
                {(report.status === 'PENDING' || report.status === 'INVESTIGATING') && (
                  <div className="flex gap-2">
                    {report.status === 'PENDING' && (
                      <Button size="sm" variant="outline" onClick={() => handleResolve(report.id, 'INVESTIGATING')}>Investigate</Button>
                    )}
                    <Button size="sm" onClick={() => handleResolve(report.id, 'RESOLVED')}>Resolve</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleResolve(report.id, 'DISMISSED')}>Dismiss</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

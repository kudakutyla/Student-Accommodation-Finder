'use client';

import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listAuditLogsRequest } from '@/services/admin.service';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/format';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listAuditLogsRequest()
      .then((res) => setLogs(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Audit Logs" description="A record of important administrative and security-sensitive actions." />
      {isLoading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-8 w-8" />} title="No audit log entries yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Performed by</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-muted-foreground">{log.entityType}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName} (${log.actor.role})` : 'System'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listLandlordsRequest, verifyLandlordRequest } from '@/services/admin.service';
import { User } from '@/types';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminLandlordsPage() {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function loadLandlords() {
    listLandlordsRequest()
      .then((res) => setLandlords(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadLandlords();
  }, []);

  async function handleAction(id: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') {
    try {
      await verifyLandlordRequest(id, status);
      setLandlords((prev) => prev.map((l) => (l.id === id ? { ...l, verificationStatus: status } : l)));
      toast.success(`Landlord status updated to ${status}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update landlord.');
    }
  }

  return (
    <div>
      <PageHeader title="Landlords" description="All registered landlord accounts and their verification status." />
      {isLoading ? (
        <LoadingState />
      ) : landlords.length === 0 ? (
        <EmptyState title="No landlords found" />
      ) : (
        <div className="space-y-3">
          {landlords.map((landlord) => (
            <Card key={landlord.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{landlord.firstName} {landlord.lastName}</p>
                    {landlord.verificationStatus && <StatusBadge status={landlord.verificationStatus} />}
                  </div>
                  <p className="text-sm text-muted-foreground">{landlord.businessName || 'No business name'} &middot; {landlord.email}</p>
                  <p className="text-xs text-muted-foreground">Joined {formatDate(landlord.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {landlord.verificationStatus !== 'VERIFIED' && (
                    <Button size="sm" onClick={() => handleAction(landlord.id, 'VERIFIED')}>Verify</Button>
                  )}
                  {landlord.verificationStatus !== 'SUSPENDED' && (
                    <Button size="sm" variant="destructive" onClick={() => handleAction(landlord.id, 'SUSPENDED')}>Suspend</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

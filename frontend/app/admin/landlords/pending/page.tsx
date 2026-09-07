'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listPendingLandlordsRequest, verifyLandlordRequest } from '@/services/admin.service';
import { User } from '@/types';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminPendingLandlordsPage() {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function loadLandlords() {
    listPendingLandlordsRequest()
      .then((res) => setLandlords(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadLandlords();
  }, []);

  async function handleDecision(id: string, status: 'VERIFIED' | 'REJECTED') {
    try {
      await verifyLandlordRequest(id, status);
      setLandlords((prev) => prev.filter((l) => l.id !== id));
      toast.success(status === 'VERIFIED' ? 'Landlord verified' : 'Landlord rejected');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update landlord.');
    }
  }

  return (
    <div>
      <PageHeader title="Landlord Verification" description="Review and verify landlord accounts awaiting approval." />
      {isLoading ? (
        <LoadingState />
      ) : landlords.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-8 w-8" />} title="No pending verifications" description="All landlord accounts have been reviewed." />
      ) : (
        <div className="space-y-3">
          {landlords.map((landlord) => (
            <Card key={landlord.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{landlord.firstName} {landlord.lastName}</p>
                  <p className="text-sm text-muted-foreground">{landlord.businessName || 'No business name'} &middot; {landlord.email}</p>
                  <p className="text-xs text-muted-foreground">Registered {formatDate(landlord.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDecision(landlord.id, 'VERIFIED')}>Verify</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDecision(landlord.id, 'REJECTED')}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

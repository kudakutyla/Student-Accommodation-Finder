'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { listAdminListingsRequest, approveListingRequest, rejectListingRequest } from '@/services/admin.service';
import { Listing } from '@/types';
import { formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminPendingListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Listing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadListings() {
    listAdminListingsRequest('PENDING')
      .then((res) => setListings(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleApprove(id: string) {
    try {
      await approveListingRequest(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing approved');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to approve listing.');
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectListingRequest(rejectTarget.id, rejectionReason);
      setListings((prev) => prev.filter((l) => l.id !== rejectTarget.id));
      toast.success('Listing rejected');
      setRejectTarget(null);
      setRejectionReason('');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to reject listing.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Listing Approval" description="Review listings submitted by landlords before they go live." />
      {isLoading ? (
        <LoadingState />
      ) : listings.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-8 w-8" />} title="No listings awaiting approval" description="New submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/listings/${listing.id}`} className="font-medium text-foreground hover:underline">
                    {listing.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {listing.owner.businessName || `${listing.owner.firstName} ${listing.owner.lastName}`} &middot; {listing.campus?.name} &middot; {formatCurrency(listing.pricePerMonth)}/mo
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(listing.id)}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejectTarget(listing)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>Provide a reason so the landlord can address the issue.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} placeholder="e.g. Photos do not match the description" />
          <DialogFooter>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

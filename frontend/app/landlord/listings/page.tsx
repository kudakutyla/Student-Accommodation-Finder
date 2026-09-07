'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Building2, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getMyListingsRequest, deleteListingRequest, updateAvailabilityRequest } from '@/services/listing.service';
import { Listing, AvailabilityStatus } from '@/types';
import { formatCurrency, availabilityLabel } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function LandlordListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const isUnverified = user?.verificationStatus !== 'VERIFIED';

  function loadListings() {
    getMyListingsRequest()
      .then((res) => setListings(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleAvailabilityChange(listing: Listing, availabilityStatus: AvailabilityStatus) {
    try {
      await updateAvailabilityRequest(listing.id, { availabilityStatus });
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, availabilityStatus } : l)));
      toast.success('Availability updated');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update availability.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteListingRequest(deleteTarget.id);
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to delete listing.');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Listings"
        description="Manage your accommodation listings and availability."
        action={
          isUnverified ? (
            <Button disabled><Plus className="mr-1 h-4 w-4" /> Create listing</Button>
          ) : (
            <LinkButton href="/landlord/listings/create"><Plus className="mr-1 h-4 w-4" /> Create listing</LinkButton>
          )
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No listings yet"
          description={isUnverified ? 'You must be verified by an admin before you can create listings.' : 'Create your first listing to start receiving enquiries.'}
        />
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/listings/${listing.id}`} className="font-semibold text-foreground hover:underline">
                      {listing.title}
                    </Link>
                    <StatusBadge status={listing.approvalStatus} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(listing.pricePerMonth)}/month &middot; {listing.availableRooms}/{listing.totalRooms} rooms available
                  </p>
                  {listing.approvalStatus === 'REJECTED' && listing.rejectionReason && (
                    <p className="mt-1 text-xs text-destructive">Reason: {listing.rejectionReason}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={listing.availabilityStatus}
                    onValueChange={(v) => handleAvailabilityChange(listing, (v ?? listing.availabilityStatus) as AvailabilityStatus)}
                  >
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['AVAILABLE', 'LIMITED', 'FULL', 'UNAVAILABLE'] as AvailabilityStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{availabilityLabel(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <LinkButton variant="outline" size="icon" href={`/landlord/listings/${listing.id}/edit`}><Pencil className="h-4 w-4" /></LinkButton>
                  <Button variant="outline" size="icon" className="text-destructive" onClick={() => setDeleteTarget(listing)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and all related favourites, enquiries and reviews. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

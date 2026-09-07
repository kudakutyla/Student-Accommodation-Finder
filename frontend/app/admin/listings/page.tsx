'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listAdminListingsRequest } from '@/services/admin.service';
import { Listing } from '@/types';
import { formatCurrency } from '@/lib/format';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading flag before a new fetch on filter change
    setIsLoading(true);
    listAdminListingsRequest(statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => setListings(res.data))
      .catch(() => toast.error('Unable to load listings.'))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <PageHeader
        title="Listings"
        description="All accommodation listings across the platform."
        action={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading ? (
        <LoadingState />
      ) : listings.length === 0 ? (
        <EmptyState title="No listings found" />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/listings/${listing.id}`} className="font-medium text-foreground hover:underline">
                      {listing.title}
                    </Link>
                    <StatusBadge status={listing.approvalStatus} />
                    <StatusBadge status={listing.availabilityStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {listing.owner.businessName || `${listing.owner.firstName} ${listing.owner.lastName}`} &middot; {listing.campus?.name}
                  </p>
                </div>
                <p className="font-semibold text-primary">{formatCurrency(listing.pricePerMonth)}/mo</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import { PageHeader } from '@/components/page-header';
import { ListingForm } from '@/components/listing-form';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { getListingRequest } from '@/services/listing.service';
import { Listing } from '@/types';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getListingRequest(id)
      .then((res) => setListing(res.data))
      .catch(() => setListing(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (!listing) return <EmptyState title="Listing not found" description="This listing may have been removed." />;

  return (
    <div>
      <PageHeader title="Edit Listing" description="Editing your listing will require it to be re-approved by an admin." />
      <ListingForm listing={listing} />
    </div>
  );
}

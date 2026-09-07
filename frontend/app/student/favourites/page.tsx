'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { ListingCard } from '@/components/listing-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { listFavouritesRequest, removeFavouriteRequest } from '@/services/favourite.service';
import { Favourite } from '@/types';

export default function StudentFavouritesPage() {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listFavouritesRequest()
      .then((res) => setFavourites(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleRemove(listingId: string) {
    try {
      await removeFavouriteRequest(listingId);
      setFavourites((prev) => prev.filter((f) => f.listingId !== listingId));
      toast.success('Favourite removed');
    } catch {
      toast.error('Unable to remove favourite.');
    }
  }

  return (
    <div>
      <PageHeader title="Saved Listings" description="Accommodation you've bookmarked for later." />
      {isLoading ? (
        <LoadingState />
      ) : favourites.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No saved listings"
          description="Browse accommodation and tap the heart icon to save your favourites here."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((fav) => (
            <ListingCard key={fav.id} listing={fav.listing} isFavourite onToggleFavourite={() => handleRemove(fav.listingId)} />
          ))}
        </div>
      )}
    </div>
  );
}

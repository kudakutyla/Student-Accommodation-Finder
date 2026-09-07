'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, BedDouble } from 'lucide-react';
import { Listing } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/link-button';
import { StarRating } from '@/components/star-rating';
import { formatCurrency, formatDistance, accommodationTypeLabel, availabilityLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60';

interface ListingCardProps {
  listing: Listing;
  isFavourite?: boolean;
  onToggleFavourite?: (listingId: string) => void;
  favouriteDisabled?: boolean;
}

export function ListingCard({ listing, isFavourite, onToggleFavourite, favouriteDisabled }: ListingCardProps) {
  const cover = listing.photos?.[0]?.url || PLACEHOLDER_IMAGE;

  return (
    <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <Link href={`/listings/${listing.id}`} className="absolute inset-0 block">
          <Image
            src={cover}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground shadow-sm" variant="secondary">
          {accommodationTypeLabel(listing.accommodationType)}
        </Badge>
        {onToggleFavourite && (
          <button
            type="button"
            aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
            onClick={() => onToggleFavourite(listing.id)}
            disabled={favouriteDisabled}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition hover:scale-105 disabled:opacity-50"
          >
            <Heart className={cn('h-4 w-4', isFavourite ? 'fill-primary text-primary' : 'text-foreground')} />
          </button>
        )}
      </div>
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${listing.id}`} className="line-clamp-1 font-semibold text-foreground hover:underline">
            {listing.title}
          </Link>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {listing.campus?.name} &middot; {formatDistance(listing.distanceFromCampus)}
          </span>
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <BedDouble className="h-3.5 w-3.5 shrink-0" />
          {listing.availableRooms} of {listing.totalRooms} rooms available &middot; {availabilityLabel(listing.availabilityStatus)}
        </p>
        <StarRating rating={listing.averageRating} reviewCount={listing.reviewCount} />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 py-3">
        <span className="text-lg font-bold text-primary">
          {formatCurrency(listing.pricePerMonth)}
          <span className="text-xs font-normal text-muted-foreground"> /month</span>
        </span>
        <LinkButton size="sm" variant="outline" href={`/listings/${listing.id}`}>View details</LinkButton>
      </CardFooter>
    </Card>
  );
}

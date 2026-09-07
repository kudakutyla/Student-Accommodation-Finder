'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent } from '@/components/ui/card';
import { getMyListingsRequest } from '@/services/listing.service';
import { listListingReviewsRequest } from '@/services/review.service';
import { Review } from '@/types';
import { formatDate } from '@/lib/format';

interface ReviewWithListing extends Review {
  listingTitle: string;
}

export default function LandlordReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyListingsRequest()
      .then(async (res) => {
        const allReviews = await Promise.all(
          res.data.map(async (listing) => {
            const reviewsRes = await listListingReviewsRequest(listing.id);
            return reviewsRes.data.map((r) => ({ ...r, listingTitle: listing.title, listingId: listing.id }));
          })
        );
        setReviews(allReviews.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Reviews" description="Ratings and reviews students have left for your listings." />
      {isLoading ? (
        <LoadingState />
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews yet" description="Reviews from students will appear here once submitted." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <Link href={`/listings/${review.listingId}`} className="font-medium text-foreground hover:underline">
                  {review.listingTitle}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {review.student?.firstName} {review.student?.lastName} &middot; {formatDate(review.createdAt)}
                </p>
                <StarRating rating={review.rating} className="mt-1" />
                {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

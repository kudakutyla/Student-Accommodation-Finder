'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listMyReviewsRequest, deleteReviewRequest } from '@/services/review.service';
import { Review } from '@/types';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export default function StudentReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listMyReviewsRequest()
      .then((res) => setReviews(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteReviewRequest(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Unable to delete review.');
    }
  }

  return (
    <div>
      <PageHeader title="My Reviews" description="Reviews you've submitted for accommodation you've stayed in." />
      {isLoading ? (
        <LoadingState />
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews yet" description="Visit a listing you've stayed at to leave a review." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <Link href={`/listings/${review.listingId}`} className="font-medium text-foreground hover:underline">
                    {review.listing?.title}
                  </Link>
                  <StarRating rating={review.rating} className="mt-1" />
                  {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(review.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

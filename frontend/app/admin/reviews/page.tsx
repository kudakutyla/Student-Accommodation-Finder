'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listAdminReviewsRequest, deleteAdminReviewRequest } from '@/services/admin.service';
import { Review } from '@/types';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listAdminReviewsRequest()
      .then((res) => setReviews(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteAdminReviewRequest(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review removed');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to delete review.');
    }
  }

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate reviews submitted across the platform." />
      {isLoading ? (
        <LoadingState />
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <Link href={`/listings/${review.listingId}`} className="font-medium text-foreground hover:underline">
                    {review.listing?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {review.student?.firstName} {review.student?.lastName} &middot; {formatDate(review.createdAt)}
                  </p>
                  <StarRating rating={review.rating} className="mt-1" />
                  {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)}>Remove</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

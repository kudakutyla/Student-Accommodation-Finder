import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  rating,
  reviewCount,
  size = 16,
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : 'No ratings'}
        {reviewCount !== undefined ? ` (${reviewCount})` : ''}
      </span>
    </div>
  );
}

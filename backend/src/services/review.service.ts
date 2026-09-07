import { prisma } from '../config/db';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/appError';
import { CreateReviewInput, UpdateReviewInput } from '../validators/review.validator';
import { createNotification } from './notification.service';

export async function createReview(studentId: string, input: CreateReviewInput) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing || listing.approvalStatus !== 'APPROVED') {
    throw new NotFoundError('Listing not found');
  }

  const existing = await prisma.review.findUnique({
    where: { studentId_listingId: { studentId, listingId: input.listingId } },
  });
  if (existing) {
    throw new ConflictError('You have already reviewed this listing. You can update your existing review instead.');
  }

  const review = await prisma.review.create({
    data: { studentId, listingId: input.listingId, rating: input.rating, comment: input.comment },
  });

  await createNotification({
    userId: listing.ownerId,
    type: 'NEW_REVIEW',
    title: 'New review received',
    message: `Your listing "${listing.title}" received a new ${input.rating}-star review.`,
    relatedEntityType: 'Review',
    relatedEntityId: review.id,
  });

  return review;
}

export async function updateReview(reviewId: string, studentId: string, input: UpdateReviewInput) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.studentId !== studentId) throw new ForbiddenError('You do not own this review');

  return prisma.review.update({
    where: { id: reviewId },
    data: { rating: input.rating, comment: input.comment },
  });
}

export async function deleteReview(reviewId: string, studentId: string, isAdmin: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (!isAdmin && review.studentId !== studentId) throw new ForbiddenError('You do not own this review');
  await prisma.review.delete({ where: { id: reviewId } });
}

export async function listReviewsForListing(listingId: string) {
  return prisma.review.findMany({
    where: { listingId },
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listMyReviews(studentId: string) {
  return prisma.review.findMany({
    where: { studentId },
    include: { listing: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listAllReviews() {
  return prisma.review.findMany({
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

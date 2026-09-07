import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import {
  createReview,
  updateReview,
  deleteReview,
  listReviewsForListing,
  listMyReviews,
  listAllReviews,
} from '../services/review.service';

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await createReview(req.user!.userId, req.body);
  return sendSuccess(res, review, 201, undefined, 'Review submitted successfully');
});

export const putReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await updateReview(req.params.id, req.user!.userId, req.body);
  return sendSuccess(res, review, 200, undefined, 'Review updated successfully');
});

export const removeReview = asyncHandler(async (req: Request, res: Response) => {
  await deleteReview(req.params.id, req.user!.userId, req.user!.role === 'ADMIN');
  return sendSuccess(res, null, 200, undefined, 'Review deleted');
});

export const getListingReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await listReviewsForListing(req.params.listingId);
  return sendSuccess(res, reviews);
});

export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await listMyReviews(req.user!.userId);
  return sendSuccess(res, reviews);
});

export const getAllReviewsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await listAllReviews();
  return sendSuccess(res, reviews);
});

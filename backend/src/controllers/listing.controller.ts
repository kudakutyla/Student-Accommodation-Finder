import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import {
  createListing,
  updateListing,
  updateAvailability,
  deleteListing,
  getListingById,
  listMyListings,
  searchListings,
} from '../services/listing.service';

export const postListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await createListing(req.user!.userId, req.body);
  return sendSuccess(res, listing, 201, undefined, 'Listing submitted for approval');
});

export const putListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await updateListing(req.params.id, req.user!.userId, req.body);
  return sendSuccess(res, listing, 200, undefined, 'Listing updated and resubmitted for approval');
});

export const patchAvailability = asyncHandler(async (req: Request, res: Response) => {
  const listing = await updateAvailability(req.params.id, req.user!.userId, req.body);
  return sendSuccess(res, listing, 200, undefined, 'Availability updated');
});

export const removeListing = asyncHandler(async (req: Request, res: Response) => {
  await deleteListing(req.params.id, req.user!.userId, req.user!.role === 'ADMIN');
  return sendSuccess(res, null, 200, undefined, 'Listing deleted');
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await getListingById(req.params.id, req.user);
  return sendSuccess(res, listing);
});

export const getMyListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await listMyListings(req.user!.userId);
  return sendSuccess(res, listings);
});

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const { listings, pagination } = await searchListings(req.query as any);
  return sendSuccess(res, listings, 200, pagination);
});

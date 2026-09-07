import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { addFavourite, removeFavourite, listFavourites } from '../services/favourite.service';

export const postFavourite = asyncHandler(async (req: Request, res: Response) => {
  const favourite = await addFavourite(req.user!.userId, req.params.listingId);
  return sendSuccess(res, favourite, 201, undefined, 'Favourite saved');
});

export const deleteFavourite = asyncHandler(async (req: Request, res: Response) => {
  await removeFavourite(req.user!.userId, req.params.listingId);
  return sendSuccess(res, null, 200, undefined, 'Favourite removed');
});

export const getFavourites = asyncHandler(async (req: Request, res: Response) => {
  const favourites = await listFavourites(req.user!.userId);
  return sendSuccess(res, favourites);
});

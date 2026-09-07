import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { listCampuses, getCampusById, createCampus, updateCampus } from '../services/campus.service';

export const getCampuses = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.user?.role === 'ADMIN' && req.query.all === 'true';
  const campuses = await listCampuses(includeInactive);
  return sendSuccess(res, campuses);
});

export const getCampus = asyncHandler(async (req: Request, res: Response) => {
  const campus = await getCampusById(req.params.id);
  return sendSuccess(res, campus);
});

export const postCampus = asyncHandler(async (req: Request, res: Response) => {
  const campus = await createCampus(req.body, req.user!.userId);
  return sendSuccess(res, campus, 201, undefined, 'Campus created successfully');
});

export const putCampus = asyncHandler(async (req: Request, res: Response) => {
  const campus = await updateCampus(req.params.id, req.body, req.user!.userId);
  return sendSuccess(res, campus, 200, undefined, 'Campus updated successfully');
});

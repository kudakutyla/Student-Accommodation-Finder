import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { createReport, listReports, resolveReport } from '../services/report.service';

export const postReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await createReport(req.user!.userId, req.body);
  return sendSuccess(res, report, 201, undefined, 'Report submitted successfully');
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await listReports(req.query.status as string | undefined);
  return sendSuccess(res, reports);
});

export const patchReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await resolveReport(req.params.id, req.user!.userId, req.body.status);
  return sendSuccess(res, report, 200, undefined, 'Report updated');
});

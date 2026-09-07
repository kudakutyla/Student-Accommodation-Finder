import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import {
  listUsers,
  listPendingLandlords,
  verifyLandlord,
  setUserSuspension,
  listAuditLogs,
  getDashboardStats,
} from '../services/admin.service';
import { adminListListings, approveListing, rejectListing } from '../services/listing.service';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  return sendSuccess(res, stats);
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role as 'STUDENT' | 'LANDLORD' | 'ADMIN' | undefined;
  const users = await listUsers(role);
  return sendSuccess(res, users);
});

export const getLandlords = asyncHandler(async (req: Request, res: Response) => {
  const users = await listUsers('LANDLORD');
  return sendSuccess(res, users);
});

export const getPendingLandlords = asyncHandler(async (_req: Request, res: Response) => {
  const landlords = await listPendingLandlords();
  return sendSuccess(res, landlords);
});

export const patchVerifyLandlord = asyncHandler(async (req: Request, res: Response) => {
  const landlord = await verifyLandlord(req.params.id, req.user!.userId, req.body);
  return sendSuccess(res, landlord, 200, undefined, 'Landlord verification status updated');
});

export const patchSuspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await setUserSuspension(req.params.id, req.user!.userId, req.body.isSuspended);
  return sendSuccess(res, user, 200, undefined, 'User status updated');
});

export const getAdminListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await adminListListings(req.query.approvalStatus as string | undefined);
  return sendSuccess(res, listings);
});

export const postApproveListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await approveListing(req.params.id, req.user!.userId);
  return sendSuccess(res, listing, 200, undefined, 'Listing approved');
});

export const postRejectListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await rejectListing(req.params.id, req.user!.userId, req.body.rejectionReason);
  return sendSuccess(res, listing, 200, undefined, 'Listing rejected');
});

export const getAuditLogs = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await listAuditLogs();
  return sendSuccess(res, logs);
});

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { createEnquiry, listMyEnquiries, getEnquiryById } from '../services/enquiry.service';

export const postEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const enquiry = await createEnquiry(req.user!.userId, req.body);
  return sendSuccess(res, enquiry, 201, undefined, 'Enquiry sent successfully');
});

export const getEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const enquiries = await listMyEnquiries(req.user!.userId, req.user!.role);
  return sendSuccess(res, enquiries);
});

export const getEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const enquiry = await getEnquiryById(req.user!.userId, req.user!.role, req.params.id);
  return sendSuccess(res, enquiry);
});

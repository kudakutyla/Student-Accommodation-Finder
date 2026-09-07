import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { listMyConversations, getConversationMessages, postMessage } from '../services/conversation.service';

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await listMyConversations(req.user!.userId, req.user!.role);
  return sendSuccess(res, conversations);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await getConversationMessages(req.params.id, req.user!.userId);
  return sendSuccess(res, result);
});

export const postConversationMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await postMessage(req.params.id, req.user!.userId, req.body.content);
  return sendSuccess(res, message, 201, undefined, 'Message sent');
});

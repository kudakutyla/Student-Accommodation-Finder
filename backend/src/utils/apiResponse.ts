import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: PaginationMeta,
  message?: string
) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(pagination ? { pagination } : {}),
  });
}

export function sendError(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

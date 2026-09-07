import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralized error handler - never leaks stack traces or internals in production.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(('details' in err && (err as any).details) ? { details: (err as any).details } : {}),
    });
  }

  // Prisma known request errors (e.g. unique constraint violations)
  if (typeof err === 'object' && err !== null && 'code' in err && typeof (err as any).code === 'string' && (err as any).code.startsWith('P')) {
    const prismaErr = err as { code: string; meta?: Record<string, unknown> };
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A record with these details already exists' });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
  }

  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
}

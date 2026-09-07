import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/appError';

// Verifies the JWT and attaches { userId, role } to req.user. Never trust role/id from the body.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing');
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Attaches req.user if a valid token is present, but does not reject the request otherwise.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice('Bearer '.length));
      req.user = { userId: payload.userId, role: payload.role };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

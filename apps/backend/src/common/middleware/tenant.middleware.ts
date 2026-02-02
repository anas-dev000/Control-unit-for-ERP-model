import { Request, Response, NextFunction } from 'express';
import { tenantStorage } from '../../lib/context';
import { UnauthorizedError } from '../errors/AppError';

// Extending Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userId?: string;
    }
  }
}

export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If not authenticated yet (e.g. login/register), skip
  // Otherwise, extract from req (populated by authMiddleware)
  const tenantId = req.headers['x-tenant-id'] as string || req.tenantId;

  if (!tenantId && req.path !== '/auth/login' && req.path !== '/auth/register' && req.path !== '/health') {
    // We expect tenantId for protected routes
    // But for simplicity in this stage, we'll just proceed if auth handles it
  }

  if (tenantId) {
    tenantStorage.run({ tenantId, userId: req.userId }, () => {
      next();
    });
  } else {
    next();
  }
};

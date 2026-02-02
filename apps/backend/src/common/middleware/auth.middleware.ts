import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyAccessToken } from '../../utils/jwt';
import { tenantStorage } from '../../lib/context';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    (req as any).userRole = decoded.role;
    
    tenantStorage.run({ tenantId: decoded.tenantId, userId: decoded.userId }, () => {
      next();
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const authorize = (...roles: string[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole;

    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

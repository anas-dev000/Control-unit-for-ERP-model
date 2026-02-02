import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { config } from '../../config/environment';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`);
  if (config.env === 'development') {
    console.error(err.stack);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // Handle Prisma / Database specific errors if needed here
  
  return res.status(500).json({
    status: 'error',
    message: config.env === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
};

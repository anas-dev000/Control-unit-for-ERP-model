import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.dto';
import { ValidationError } from '../../common/errors/AppError';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const data = await AuthService.register(result.data);
      res.status(201).json({
        status: 'success',
        message: 'Account created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const data = await AuthService.login(result.data);
      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

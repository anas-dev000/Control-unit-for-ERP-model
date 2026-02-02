import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { createUserSchema, updateUserSchema } from './user.dto';
import { ValidationError } from '../../common/errors/AppError';

export class UserController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.list();
      res.json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createUserSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid user data', result.error.format());
      }
      const user = await UserService.create(result.data);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid update data', result.error.format());
      }
      const user = await UserService.update(req.params.id as string, result.data);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.delete(req.params.id as string);
      res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

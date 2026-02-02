import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { updateTenantSchema } from './tenant.dto';
import { ValidationError } from '../../common/errors/AppError';

export class TenantController {
  static async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.getCurrent();
      res.json({ status: 'success', data: tenant });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateTenantSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid company data', result.error.format());
      }
      const tenant = await TenantService.update(result.data);
      res.json({ status: 'success', data: tenant });
    } catch (error) {
      next(error);
    }
  }
}

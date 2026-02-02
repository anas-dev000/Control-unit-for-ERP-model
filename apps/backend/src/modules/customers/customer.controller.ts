import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { createCustomerSchema, updateCustomerSchema } from './customer.dto';
import { ValidationError } from '../../common/errors/AppError';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createCustomerSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const customer = await CustomerService.create(result.data);
      res.status(201).json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const { customers, meta } = await CustomerService.findAll(page, limit, search);
      res.status(200).json({ status: 'success', data: customers, meta });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.findById(req.params.id);
      res.status(200).json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateCustomerSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const customer = await CustomerService.update(req.params.id, result.data);
      res.status(200).json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomerService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

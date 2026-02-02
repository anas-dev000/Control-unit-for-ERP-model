import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoice.service';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './invoice.dto';
import { ValidationError } from '../../common/errors/AppError';

export class InvoiceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createInvoiceSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const invoice = await InvoiceService.create(result.data);
      res.status(201).json({ status: 'success', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;

      const { invoices, meta } = await InvoiceService.findAll(page, limit, status, customerId);
      res.status(200).json({ status: 'success', data: invoices, meta });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.findById(req.params.id as string);
      res.status(200).json({ status: 'success', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateInvoiceStatusSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const invoice = await InvoiceService.updateStatus(req.params.id as string, result.data.status);
      res.status(200).json({ status: 'success', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      await InvoiceService.cancel(req.params.id as string);
      res.status(200).json({ status: 'success', message: 'Invoice cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }
}

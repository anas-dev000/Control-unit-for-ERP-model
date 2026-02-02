import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { recordPaymentSchema } from './payment.dto';
import { ValidationError } from '../../common/errors/AppError';

export class PaymentController {
  static async record(req: Request, res: Response, next: NextFunction) {
    try {
      const result = recordPaymentSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid input data', result.error.format());
      }

      const payment = await PaymentService.record(result.data);
      res.status(201).json({ status: 'success', data: payment });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const customerId = req.query.customerId as string;

      const { payments, meta } = await PaymentService.findAll(page, limit, customerId);
      res.status(200).json({ status: 'success', data: payments, meta });
    } catch (error) {
      next(error);
    }
  }
}

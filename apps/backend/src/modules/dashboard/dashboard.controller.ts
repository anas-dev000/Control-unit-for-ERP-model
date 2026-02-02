import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary();
      res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async getAging(_req: Request, res: Response, next: NextFunction) {
    try {
      const aging = await DashboardService.getAgingReport();
      res.status(200).json({ status: 'success', data: aging });
    } catch (error) {
      next(error);
    }
  }
}

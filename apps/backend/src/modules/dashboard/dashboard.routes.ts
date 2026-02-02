import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', DashboardController.getSummary);
router.get('/aging', DashboardController.getAging);

export default router;

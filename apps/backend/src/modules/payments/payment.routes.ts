import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', PaymentController.record);
router.get('/', PaymentController.findAll);

export default router;

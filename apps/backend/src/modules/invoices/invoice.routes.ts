import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', InvoiceController.create);
router.get('/', InvoiceController.findAll);
router.get('/:id', InvoiceController.findById);
router.patch('/:id/status', InvoiceController.updateStatus);
router.delete('/:id', InvoiceController.cancel);

export default router;

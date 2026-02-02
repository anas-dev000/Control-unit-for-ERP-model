import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', CustomerController.create);
router.get('/', CustomerController.findAll);
router.get('/:id', CustomerController.findById);
router.patch('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);

export default router;

import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Only admins can manage users
router.get('/', authorize('ADMIN'), UserController.list);
router.post('/', authorize('ADMIN'), UserController.create);
router.patch('/:id', authorize('ADMIN'), UserController.update);
router.delete('/:id', authorize('ADMIN'), UserController.delete);

export default router;

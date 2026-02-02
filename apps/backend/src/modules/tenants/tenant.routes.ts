import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authMiddleware, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/me', TenantController.getCurrent);
router.patch('/me', authorize('ADMIN'), TenantController.update);

export default router;

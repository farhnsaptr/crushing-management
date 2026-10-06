import { Router } from 'express';
import { MixedMaterialsController } from './mixedMaterials.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', MixedMaterialsController.list);
router.get('/:id/members', MixedMaterialsController.getMembers);

router.post('/', requireRole(['super-admin', 'admin']), MixedMaterialsController.create);
router.put('/:id', requireRole(['super-admin', 'admin']), MixedMaterialsController.update);
router.delete('/:id', requireRole(['super-admin', 'admin']), MixedMaterialsController.remove);

export default router;

import { Router } from 'express';
import { MaterialsController } from './materials.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', MaterialsController.listAll);
router.get('/:id', MaterialsController.getById);
router.get('/:id/parts', MaterialsController.getParts);

router.delete('/all', requireRole(['super-admin']), MaterialsController.deleteAll);

router.post('/', requireRole(['super-admin', 'admin']), MaterialsController.create);
router.put('/:id', requireRole(['super-admin', 'admin']), MaterialsController.update);
router.delete('/:id', requireRole(['super-admin', 'admin']), MaterialsController.delete);

export default router;

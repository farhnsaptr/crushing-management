import { Router } from 'express';
import { CrushingRequestsController } from './crushingRequests.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// Draft routes (Must be declared before /:id)
router.get('/draft', verifyToken, CrushingRequestsController.getDraft);
router.put('/draft', verifyToken, CrushingRequestsController.saveDraft);
router.delete('/draft', verifyToken, CrushingRequestsController.deleteDraft);

// Create, List, & Cancel requests for authenticated users
router.post('/', verifyToken, CrushingRequestsController.createRequest);
router.get('/', verifyToken, CrushingRequestsController.listRequests);
router.get('/:id', verifyToken, CrushingRequestsController.getRequestById);
router.delete('/:id', verifyToken, CrushingRequestsController.cancelRequest);

// Verification & Approval actions by Operator / Admin / Super-Admin
router.patch('/:id/approve', verifyToken, requireRole(['super-admin', 'admin', 'operator']), CrushingRequestsController.approveRequest);

export default router;

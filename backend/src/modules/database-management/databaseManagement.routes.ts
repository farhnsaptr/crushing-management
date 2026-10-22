import { Router } from 'express';
import { DatabaseManagementController } from './databaseManagement.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// Protect all routes with Super-Admin authorization
router.use(verifyToken);
router.use(requireRole(['super-admin']));

// Request Management Routes
router.get('/requests', DatabaseManagementController.listRequests);
router.get('/requests/:id', DatabaseManagementController.getRequestDetail);
router.post('/requests/:id/unapprove', DatabaseManagementController.unapproveRequest);
router.put('/requests/:id', DatabaseManagementController.updateRequestHeader);
router.delete('/requests/:id', DatabaseManagementController.deleteRequest);

// Request Items Management Routes
router.post('/requests/:id/items/batch', DatabaseManagementController.addItemsBatchToRequest);
router.post('/requests/:id/items', DatabaseManagementController.addItemToRequest);
router.put('/requests/:id/items/:itemId', DatabaseManagementController.updateRequestItem);
router.delete('/requests/:id/items/:itemId', DatabaseManagementController.deleteRequestItem);

// Direct NG Transactions Management Routes
router.get('/transactions/ng', DatabaseManagementController.listNgTransactions);
router.put('/transactions/ng/:id', DatabaseManagementController.updateNgTransaction);
router.delete('/transactions/ng/:id', DatabaseManagementController.deleteNgTransaction);

// Direct Runner Transactions Management Routes
router.get('/transactions/runner', DatabaseManagementController.listRunnerTransactions);
router.put('/transactions/runner/:id', DatabaseManagementController.updateRunnerTransaction);
router.delete('/transactions/runner/:id', DatabaseManagementController.deleteRunnerTransaction);

export default router;

import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/summary', DashboardController.getSummary);
router.get('/daily-chart', DashboardController.getDailyChart);
router.get('/pareto-material', DashboardController.getParetoMaterial);
router.get('/top-ng-parts', DashboardController.getTopNgParts);
router.get('/departments-pareto', DashboardController.getDepartmentPareto);
router.get('/sender-stats', verifyToken, DashboardController.getSenderStats);
router.get('/export', DashboardController.exportExcel);

export default router;

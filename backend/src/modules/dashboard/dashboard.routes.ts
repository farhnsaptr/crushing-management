import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     summary: Get Total Input (kg), Total Output (kg), and Waste (kg)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, example: 8 }
 *       - in: query
 *         name: location
 *         schema: { type: string, enum: [Cibitung, Karawang], example: "Cibitung" }
 *     responses:
 *       200:
 *         description: Summary stats object
 */
router.get('/summary', DashboardController.getSummary);

/**
 * @openapi
 * /api/dashboard/daily-chart:
 *   get:
 *     summary: Get daily total recycle material chart data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily chart dataset
 */
router.get('/daily-chart', DashboardController.getDailyChart);

/**
 * @openapi
 * /api/dashboard/pareto-material:
 *   get:
 *     summary: Get pareto ranking table data by material type (Top 10)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pareto table dataset
 */
router.get('/pareto-material', DashboardController.getParetoMaterial);

/**
 * @openapi
 * /api/dashboard/top-ng-parts:
 *   get:
 *     summary: Get top NG rejected parts table data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top NG parts dataset
 */
router.get('/top-ng-parts', DashboardController.getTopNgParts);

/**
 * @openapi
 * /api/dashboard/export-excel:
 *   get:
 *     summary: Export dashboard report as an Excel spreadsheet (.xlsx)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Downloadable Excel file binary
 */
router.get('/export-excel', DashboardController.exportExcel);

export default router;

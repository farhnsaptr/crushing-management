import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     summary: Get Total Input (kg), Runner (kg), Output (kg), and Waste (kg)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date, example: "2026-08-01" }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date, example: "2026-08-31" }
 *     responses:
 *       200:
 *         description: Summary stats object
 */
router.get('/summary', DashboardController.getSummary);

/**
 * @openapi
 * /api/dashboard/daily-chart:
 *   get:
 *     summary: Get daily stacked bar chart data (kg per day per shift)
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
 *     summary: Get pareto ranking table data by material type (kg)
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
 *     summary: Get top NG rejected parts table data (by pcs)
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
 * /api/dashboard/stream:
 *   get:
 *     summary: Server-Sent Events (SSE) endpoint for real-time dashboard updates
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event stream connection established
 */
router.get('/stream', DashboardController.sseStream);

/**
 * @openapi
 * /api/dashboard/export:
 *   get:
 *     summary: Export dashboard dataset for Excel report generation
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consolidated dataset for export
 */
router.get('/export', DashboardController.exportData);

export default router;

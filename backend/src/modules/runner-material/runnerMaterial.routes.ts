import { Router } from 'express';
import { RunnerMaterialController } from './runnerMaterial.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { importLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/runner-material/preview:
 *   post:
 *     summary: Preview and calculate runner weight per material from CSV parsed rows
 *     tags: [Runner Material]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [records]
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [date, sebango_code, shift, act_total_pcs]
 *     responses:
 *       200:
 *         description: Preview calculation grouped per material
 */
router.post('/preview', importLimiter, RunnerMaterialController.preview);

/**
 * @openapi
 * /api/runner-material/save:
 *   post:
 *     summary: Save confirmed runner material transactions per material
 *     tags: [Runner Material]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, transaction_date]
 *     responses:
 *       200:
 *         description: Successfully saved runner material records
 */
router.post('/save', importLimiter, RunnerMaterialController.save);

/**
 * @openapi
 * /api/runner-material:
 *   get:
 *     summary: List paginated runner material transactions
 *     tags: [Runner Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of runner material transactions
 */
router.get('/', RunnerMaterialController.list);

/**
 * Analytics summary grouped by material (sorted list)
 */
router.get('/analytics/summary', RunnerMaterialController.getAnalyticsSummary);

/**
 * Monthly trend chart & transaction history for a material
 */
router.get('/analytics/detail', RunnerMaterialController.getAnalyticsDetail);

/**
 * Delete all runner material transactions (Super-Admin only)
 */
router.delete('/all', requireRole(['super-admin']), RunnerMaterialController.deleteAll);

/**
 * Update an individual runner material record (Super-Admin & Admin)
 */
router.put('/:id', requireRole(['super-admin', 'admin']), RunnerMaterialController.update);

/**
 * Delete an individual runner material record (Super-Admin & Admin)
 */
router.delete('/:id', requireRole(['super-admin', 'admin']), RunnerMaterialController.delete);

export default router;


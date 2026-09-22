import { Router } from 'express';
import multer from 'multer';
import { RunnerMaterialController } from './runnerMaterial.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';
import { importLimiter } from '../../middlewares/rateLimiter.middleware';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for large Excel spreadsheets
});

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/runner-material/preview:
 *   post:
 *     summary: Preview and calculate runner weight per material from Excel (.xlsx/.xls) or CSV file
 *     tags: [Runner Material]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *       - application/json
 *     responses:
 *       200:
 *         description: Preview calculation grouped per material
 */
router.post('/preview', importLimiter, uploadMemory.single('file'), RunnerMaterialController.preview);

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
 * List unique import batches with metadata for rollback (Super-Admin & Admin)
 */
router.get('/batches', requireRole(['super-admin', 'admin']), RunnerMaterialController.listBatches);

/**
 * Rollback all records in a specific batch (Super-Admin & Admin)
 */
router.delete('/batch/:batchRef', requireRole(['super-admin', 'admin']), RunnerMaterialController.rollbackBatch);
router.post('/rollback-batch', requireRole(['super-admin', 'admin']), RunnerMaterialController.rollbackBatch);

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


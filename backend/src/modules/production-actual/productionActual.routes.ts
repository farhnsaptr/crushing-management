import { Router } from 'express';
import { ProductionActualController } from './productionActual.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { importLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/production-actual/import:
 *   post:
 *     summary: Import shopfloor actual production CSV/JSON data (Rate limited)
 *     tags: [Production Actual]
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
 *               batch_ref: { type: string, description: "Referensi unik ID/nama batch import CSV" }
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [production_date, sebango_code, shift, actual_qty_pcs]
 *                   properties:
 *                     production_date: { type: string, format: date, description: "Tanggal produksi (YYYY-MM-DD)" }
 *                     sebango_code: { type: string, description: "Kode Sebango part" }
 *                     shift: { type: string, enum: [D, N, Pagi, Malam], description: "Shift kerja" }
 *                     actual_qty_pcs: { type: integer, description: "Jumlah pcs hasil produksi aktual" }
 *     responses:
 *       200:
 *         description: Batch import result summary
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/import', importLimiter, ProductionActualController.importRecords);

/**
 * @openapi
 * /api/production-actual:
 *   get:
 *     summary: List imported production actual records
 *     tags: [Production Actual]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, description: "Halaman data" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, description: "Jumlah item per halaman" }
 *     responses:
 *       200:
 *         description: List of production actual records
 */
router.get('/', ProductionActualController.list);

export default router;

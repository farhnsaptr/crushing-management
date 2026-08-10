import { Router } from 'express';
import { NgTransactionsController } from './ngTransactions.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/ng-transactions:
 *   post:
 *     summary: Submit new NG Part transaction (Typed or Scan) & broadcast SSE event
 *     tags: [NG Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [master_part_id, quantity_pcs, shift, input_method, transaction_date]
 *             properties:
 *               master_part_id: { type: string, format: uuid, description: "ID Master Part (UUID)" }
 *               quantity_pcs: { type: integer, description: "Jumlah pcs barang NG" }
 *               shift: { type: string, enum: [Pagi, Malam], description: "Shift kerja (Pagi/Malam)" }
 *               input_method: { type: string, enum: [typed, scan], description: "Metode input data (typed/scan)" }
 *               transaction_date: { type: string, format: date, description: "Tanggal transaksi (YYYY-MM-DD)" }
 *               notes: { type: string, description: "Catatan detail cacat/NG" }
 *     responses:
 *       201:
 *         description: Transaction recorded
 *   get:
 *     summary: List NG transactions history with optional date range filter
 *     tags: [NG Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, description: "Halaman data" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, description: "Jumlah item per halaman" }
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date, description: "Filter tanggal awal (YYYY-MM-DD)" }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date, description: "Filter tanggal akhir (YYYY-MM-DD)" }
 *     responses:
 *       200:
 *         description: Transaction list
 */
router.post('/', NgTransactionsController.create);
router.get('/', NgTransactionsController.list);
router.get('/summary-by-material', NgTransactionsController.getSummaryByMaterial);
router.get('/part-detail/:partId', NgTransactionsController.getPartMonthlyDetail);

export default router;

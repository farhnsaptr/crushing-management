import { Router } from 'express';
import { GlobalLogsController } from './globalLogs.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken, requireRole(['admin']));

/**
 * @openapi
 * /api/admin/logs:
 *   get:
 *     summary: Read API request audit logs from Redis Stream (Admin only)
 *     tags: [Global Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: start_id
 *         schema: { type: string, default: "+" }
 *       - in: query
 *         name: end_id
 *         schema: { type: string, default: "-" }
 *     responses:
 *       200:
 *         description: Audit logs list from Redis Stream
 */
router.get('/', GlobalLogsController.getLogs);

export default router;

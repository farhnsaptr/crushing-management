import { Router } from 'express';
import { GlobalLogsController } from './globalLogs.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// Global Audit Logs requires super-admin role
router.use(verifyToken, requireRole(['super-admin']));

/**
 * @openapi
 * /api/admin/logs/stream:
 *   get:
 *     summary: Real-time Server-Sent Events (SSE) stream for API request logs (Super-Admin only)
 *     tags: [Global Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event stream established
 */
router.get('/stream', GlobalLogsController.streamLogs);

/**
 * @openapi
 * /api/admin/logs:
 *   get:
 *     summary: Read API request audit logs from Redis Stream (Super-Admin only)
 *     tags: [Global Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Audit logs list from Redis Stream
 *   delete:
 *     summary: Purge/clear all audit logs in Redis Stream (Super-Admin only)
 *     tags: [Global Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All audit logs cleared
 */
router.get('/', GlobalLogsController.getLogs);
router.delete('/', GlobalLogsController.clearAllLogs);

export default router;

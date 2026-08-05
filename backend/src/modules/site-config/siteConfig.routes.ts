import { Router } from 'express';
import { SiteConfigController } from './siteConfig.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/site-config:
 *   get:
 *     summary: Retrieve site theme colors configuration (Light/Dark mode)
 *     tags: [Site Config]
 *     responses:
 *       200:
 *         description: Key-value object of theme hex colors
 *   put:
 *     summary: Update site theme hex colors (Admin only)
 *     tags: [Site Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [settings]
 *             properties:
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [key, value]
 *                   properties:
 *                     key: { type: string, description: "Nama kunci variabel konfigurasi tema" }
 *                     value: { type: string, description: "Nilai kode warna HEX (#RRGGBB)" }
 *     responses:
 *       200:
 *         description: Updated site config
 */
router.get('/', SiteConfigController.getConfig);
router.put('/', verifyToken, requireRole(['admin']), SiteConfigController.updateConfig);

export default router;

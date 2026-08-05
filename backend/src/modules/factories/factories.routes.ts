import { Router } from 'express';
import { FactoriesController } from './factories.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/factories:
 *   get:
 *     summary: List all factories
 *     tags: [Factories Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of factories
 *   post:
 *     summary: Create a new factory (Admin only)
 *     tags: [Factories Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name]
 *             properties:
 *               code: { type: string, description: "Kode unik pabrik" }
 *               name: { type: string, description: "Nama pabrik" }
 *               location: { type: string, description: "Alamat/lokasi pabrik" }
 *     responses:
 *       201:
 *         description: Factory created
 */
router.get('/', FactoriesController.list);

/**
 * @openapi
 * /api/factories/{id}:
 *   get:
 *     summary: Get factory by ID
 *     tags: [Factories Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Pabrik (UUID)" }
 *     responses:
 *       200:
 *         description: Factory details
 *   put:
 *     summary: Update factory by ID (Admin only)
 *     tags: [Factories Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Pabrik (UUID)" }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string, description: "Kode pabrik baru" }
 *               name: { type: string, description: "Nama pabrik baru" }
 *               location: { type: string, description: "Alamat/lokasi baru" }
 *     responses:
 *       200:
 *         description: Factory updated
 *   delete:
 *     summary: Delete factory by ID (Admin only)
 *     tags: [Factories Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Pabrik (UUID)" }
 *     responses:
 *       200:
 *         description: Factory deleted
 */
router.get('/:id', FactoriesController.getById);
router.post('/', requireRole(['super-admin', 'admin']), FactoriesController.create);
router.put('/:id', requireRole(['super-admin', 'admin']), FactoriesController.update);
router.delete('/:id', requireRole(['super-admin', 'admin']), FactoriesController.delete);

export default router;

import { Router } from 'express';
import { MachinesController } from './machines.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/machines:
 *   get:
 *     summary: List all injection molding machines
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of machines
 *   post:
 *     summary: Create a new machine (Admin only)
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [factory_id, code, name]
 *             properties:
 *               factory_id: { type: string, format: uuid, description: "ID Pabrik (UUID)" }
 *               code: { type: string, description: "Kode mesin (misal MC-01)" }
 *               name: { type: string, description: "Nama deskriptif mesin" }
 *               type: { type: string, description: "Tipe mesin (default: Injection Mold)" }
 *               tonnage: { type: string, description: "Kapasitas tonase mesin" }
 *     responses:
 *       201:
 *         description: Machine created
 */
router.get('/', MachinesController.list);

/**
 * @openapi
 * /api/machines/by-factory/{factory_id}:
 *   get:
 *     summary: List machines by factory ID
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: factory_id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Pabrik (UUID)" }
 *     responses:
 *       200:
 *         description: List of active machines for given factory
 */
router.get('/by-factory/:factory_id', MachinesController.getByFactory);

/**
 * @openapi
 * /api/machines/{id}:
 *   get:
 *     summary: Get machine details by ID
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Mesin (UUID)" }
 *     responses:
 *       200:
 *         description: Machine details
 *   put:
 *     summary: Update machine details by ID (Admin only)
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Mesin (UUID)" }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               factory_id: { type: string, format: uuid, description: "ID Pabrik baru" }
 *               code: { type: string, description: "Kode mesin baru" }
 *               name: { type: string, description: "Nama mesin baru" }
 *               type: { type: string, description: "Tipe mesin baru" }
 *               tonnage: { type: string, description: "Tonase baru" }
 *               status: { type: string, enum: [active, inactive], description: "Status mesin" }
 *     responses:
 *       200:
 *         description: Machine updated
 *   delete:
 *     summary: Delete machine by ID (Admin only)
 *     tags: [Machines Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID Mesin (UUID)" }
 *     responses:
 *       200:
 *         description: Machine deleted
 */
router.get('/:id', MachinesController.getById);

router.post('/', requireRole(['admin']), MachinesController.create);
router.put('/:id', requireRole(['admin']), MachinesController.update);
router.delete('/:id', requireRole(['admin']), MachinesController.delete);

export default router;

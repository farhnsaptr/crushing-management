import { Router } from 'express';
import { MasterPartsController } from './masterParts.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/master-parts/search:
 *   get:
 *     summary: Autocomplete best-possible-search by part_number or part_name
 *     tags: [Master Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, description: "Kata kunci pencarian part number atau part name" }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', MasterPartsController.search);

/**
 * @openapi
 * /api/master-parts/models:
 *   get:
 *     summary: Get distinct vehicle models for a specific part number
 *     tags: [Master Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: part_number
 *         required: true
 *         schema: { type: string, description: "Nomor part komplit" }
 *     responses:
 *       200:
 *         description: Models list for given part number
 */
router.get('/models', MasterPartsController.getModelsForPart);

/**
 * @openapi
 * /api/master-parts/by-qr:
 *   get:
 *     summary: Lookup part details instantly by QR code value
 *     tags: [Master Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: qr
 *         required: true
 *         schema: { type: string, description: "Nilai QR code terrekam" }
 *     responses:
 *       200:
 *         description: Part details
 */
router.get('/by-qr', MasterPartsController.getByQr);

/**
 * @openapi
 * /api/master-parts/by-jenis:
 *   get:
 *     summary: Filter master parts by jenis_part
 *     tags: [Master Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jenis
 *         required: true
 *         schema: { type: string, description: "Kategori/Jenis Part (misal BUMPER, GRILLE, GARNISH)" }
 *     responses:
 *       200:
 *         description: List of parts matching jenis_part
 */
router.get('/by-jenis', MasterPartsController.getByJenis);

/**
 * @openapi
 * /api/master-parts:
 *   get:
 *     summary: List all active master parts (Paginated)
 *     tags: [Master Parts]
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
 *         description: Paginated list of master parts
 *   post:
 *     summary: Create a new master part entry (Admin only)
 *     tags: [Master Parts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sebango_code, machine_id, customer, model_id, part_number, part_name, jenis_part, material, berat_part_gr]
 *             properties:
 *               sebango_code: { type: string, description: "Kode Sebango" }
 *               machine_id: { type: string, format: uuid, description: "ID Mesin (UUID)" }
 *               customer: { type: string, description: "Nama Customer (misal ADM, TMMIN)" }
 *               model_id: { type: string, format: uuid, description: "ID Model Kendaraan (UUID)" }
 *               part_number: { type: string, description: "Part Number" }
 *               part_name: { type: string, description: "Part Name" }
 *               jenis_part: { type: string, description: "Jenis/Kategori Part" }
 *               material: { type: string, description: "Bahan/Material Plastik" }
 *               shikake: { type: integer, description: "Jumlah Shikake (default: 1)" }
 *               berat_part_gr: { type: number, description: "Berat bersih part dalam gram" }
 *               berat_runner_gr: { type: number, description: "Berat runner dalam gram" }
 *               image_url: { type: string, description: "URL gambar ilustrasi part" }
 *               qr_code_value: { type: string, description: "Nilai unik QR code scanner" }
 *     responses:
 *       201:
 *         description: Master part created
 */
router.get('/', MasterPartsController.listAll);
router.post('/', requireRole(['super-admin', 'admin']), MasterPartsController.create);

export default router;

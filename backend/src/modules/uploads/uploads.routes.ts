import { Router } from 'express';
import multer from 'multer';
import { UploadsController } from './uploads.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { MAX_CHUNK_BYTES } from './uploads.service';

const uploadChunk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CHUNK_BYTES },
});

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/uploads/chunk:
 *   post:
 *     summary: Upload satu potongan (chunk) file besar agar lolos limit body 1MB nginx
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [index, chunk]
 *             properties:
 *               upload_id: { type: string, format: uuid, description: 'Kosongkan pada chunk pertama; server membuat & mengembalikannya' }
 *               index: { type: integer }
 *               chunk: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Chunk tersimpan, mengembalikan { upload_id }
 */
router.post('/chunk', uploadChunk.single('chunk'), UploadsController.uploadChunk);

export default router;

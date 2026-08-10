import { Router } from 'express';
import multer from 'multer';
import { MasterPartsController } from './masterParts.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB file size limit
});

const router = Router();

router.use(verifyToken);

// Public/Read-only query routes
router.get('/search', MasterPartsController.search);
router.get('/models', MasterPartsController.getModelsForPart);
router.get('/by-qr', MasterPartsController.getByQr);
router.get('/by-jenis', MasterPartsController.getByJenis);
router.get('/jenis-list', MasterPartsController.getJenisPartList);

// Excel Template Download & Export Data Routes (Admin/Super-Admin)
router.get('/template', requireRole(['super-admin', 'admin']), MasterPartsController.downloadTemplate);
router.get('/export', requireRole(['super-admin', 'admin']), MasterPartsController.exportParts);

// Paginated List Route
router.get('/', MasterPartsController.listAll);

router.delete('/all', requireRole(['super-admin']), MasterPartsController.deleteAll);

// Master Parts Mutation Routes (Admin/Super-Admin)
router.post('/', requireRole(['super-admin', 'admin']), MasterPartsController.create);
router.put('/:id', requireRole(['super-admin', 'admin']), MasterPartsController.update);
router.delete('/:id', requireRole(['super-admin', 'admin']), MasterPartsController.delete);

// Two-Step Excel Import Routes (Preview & Commit)
router.post(
  '/preview-import',
  requireRole(['super-admin', 'admin']),
  uploadMemory.single('file'),
  MasterPartsController.previewImport
);

router.post(
  '/commit-import',
  requireRole(['super-admin', 'admin']),
  MasterPartsController.commitImport
);

// Upload Part Image to MinIO S3
router.post(
  '/:id/upload-image',
  requireRole(['super-admin', 'admin']),
  uploadMemory.single('image'),
  MasterPartsController.uploadPartImage
);

export default router;

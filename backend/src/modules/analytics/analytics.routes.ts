import { Router } from 'express';
import multer from 'multer';
import { AnalyticsController } from './analytics.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for large Excel spreadsheets
});

const router = Router();

// Protect all analytics endpoints with verifyToken
router.use((req, res, next) => verifyToken(req, res, next));

// 1. Upload, Preview & Import Production Report (Excel .xlsx / .xls / CSV) - Operator to Super Admin
router.post(
  '/preview',
  requireRole(['super-admin', 'admin', 'operator']),
  uploadMemory.single('file'),
  (req, res) => AnalyticsController.previewProductionReport(req, res)
);
router.post(
  '/upload',
  requireRole(['super-admin', 'admin', 'operator']),
  uploadMemory.single('file'),
  (req, res) => AnalyticsController.importProductionReport(req, res)
);

// 2. Get Yearly Comparison Chart Data (12 months) - All authenticated roles (including pengirim)
router.get('/yearly-comparison', (req, res) => AnalyticsController.getYearlyComparison(req, res));

// 3. Pareto Analysis Routes - All authenticated roles
router.get('/pareto/materials', (req, res) => AnalyticsController.getParetoMaterials(req, res));
router.get('/pareto/parts-ng', (req, res) => AnalyticsController.getParetoPartsNg(req, res));

// 4. Get Paginated Production Records - All authenticated roles
router.get('/records', (req, res) => AnalyticsController.getRecords(req, res));

// 5. Batches History (Viewable by all) & Rollback / Delete (Operator to Super Admin only)
router.get('/batches', (req, res) => AnalyticsController.getBatches(req, res));
router.post(
  '/rollback',
  requireRole(['super-admin', 'admin', 'operator']),
  (req, res) => AnalyticsController.rollbackLatestBatch(req, res)
);
router.delete(
  '/batches/:batchId',
  requireRole(['super-admin', 'admin', 'operator']),
  (req, res) => AnalyticsController.deleteBatch(req, res)
);

export default router;

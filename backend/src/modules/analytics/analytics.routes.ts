import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// Protect all analytics endpoints with verifyToken
router.use((req, res, next) => verifyToken(req, res, next));

// 1. Upload, Preview & Import Production Report CSV
router.post('/preview', (req, res) => AnalyticsController.previewProductionReport(req, res));
router.post('/upload', (req, res) => AnalyticsController.importProductionReport(req, res));

// 2. Get Yearly Comparison Chart Data (12 months)
router.get('/yearly-comparison', (req, res) => AnalyticsController.getYearlyComparison(req, res));

// 3. Pareto Analysis Routes
router.get('/pareto/materials', (req, res) => AnalyticsController.getParetoMaterials(req, res));
router.get('/pareto/parts-ng', (req, res) => AnalyticsController.getParetoPartsNg(req, res));

// 4. Get Paginated Production Records
router.get('/records', (req, res) => AnalyticsController.getRecords(req, res));

// 5. Batches History, Delete & Rollback
router.post('/rollback', (req, res) => AnalyticsController.rollbackLatestBatch(req, res));
router.get('/batches', (req, res) => AnalyticsController.getBatches(req, res));
router.delete('/batches/:batchId', (req, res) => AnalyticsController.deleteBatch(req, res));

export default router;

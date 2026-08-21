import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { VerificationController } from './verification.controller';

const router = Router();

// Protect all verification routes with verifyToken middleware
router.use((req, res, next) => verifyToken(req, res, next));

// GET /api/verifications/details?date=YYYY-MM-DD&shift=Pagi|Malam
router.get('/details', (req, res) => VerificationController.getVerificationDetails(req, res));

// POST /api/verifications/save
router.post('/save', (req, res) => VerificationController.saveVerification(req, res));

// GET /api/verifications/status?date=YYYY-MM-DD&shift=Pagi|Malam
router.get('/status', (req, res) => VerificationController.getDashboardStatus(req, res));

export default router;

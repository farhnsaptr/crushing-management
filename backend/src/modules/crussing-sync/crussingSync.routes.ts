import { Router } from 'express';
import { requireRole, verifyToken } from '../../middlewares/auth.middleware';
import { importLimiter } from '../../middlewares/rateLimiter.middleware';
import { CrussingSyncController } from './crussingSync.controller';

const router = Router();

router.use(verifyToken);

// Status lokal (tidak memanggil API eksternal) - semua role yang login boleh melihat.
router.get('/status', CrussingSyncController.getStatus);
router.get('/unmatched-sebangos', CrussingSyncController.getUnmatchedSebangos);

// Tarik data dari Crusing API - hanya role yang boleh mengubah data.
router.post(
 '/sync',
 requireRole(['super-admin', 'admin', 'operator']),
 importLimiter,
 CrussingSyncController.sync
);

export default router;

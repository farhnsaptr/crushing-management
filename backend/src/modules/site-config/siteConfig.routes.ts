import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { SiteConfigController } from './siteConfig.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, WEBP, SVG, ICO) are allowed'));
    }
  },
});

const router = Router();

// GET is public for fetching application logo, title, and theme tokens
router.get('/', SiteConfigController.getConfig);

// Super-Admin only routes for site configuration mutation
router.put('/', verifyToken, requireRole(['super-admin']), SiteConfigController.updateConfig);
router.post('/upload', verifyToken, requireRole(['super-admin']), upload.single('file'), SiteConfigController.uploadFile);

export default router;

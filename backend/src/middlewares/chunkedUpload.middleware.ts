import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UploadsService } from '../modules/uploads/uploads.service';
import { sendError } from '../utils/response.util';

/**
 * Jika request membawa `upload_id` (file sudah diunggah per-chunk lewat POST /api/uploads/chunk),
 * rakit chunk menjadi `req.file` sehingga controller tetap membaca `req.file.buffer` seperti upload biasa.
 * Folder chunk dihapus setelah response selesai.
 */
export async function attachChunkedFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const uploadId = req.body?.upload_id;
  if (req.file || !uploadId || !req.user) {
    next();
    return;
  }

  const userId = req.user.id;
  // Chunk sekali pakai: dihapus setelah response selesai, baik sukses maupun gagal.
  res.on('close', () => {
    UploadsService.remove(userId, String(uploadId)).catch(() => undefined);
  });

  try {
    const buffer = await UploadsService.assemble(userId, String(uploadId), Number(req.body?.total_chunks));
    req.file = {
      buffer,
      size: buffer.length,
      originalname: String(req.body?.filename || 'upload.xlsx'),
      fieldname: 'file',
    } as Express.Multer.File;
    next();
  } catch (error: any) {
    sendError(res, error.message || 'Gagal merakit file upload', 400);
  }
}

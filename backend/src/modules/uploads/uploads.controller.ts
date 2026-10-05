import { Response } from 'express';
import { randomUUID } from 'crypto';
import { UploadsService } from './uploads.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class UploadsController {
  static async uploadChunk(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'Chunk file wajib disertakan', 400);
        return;
      }
      // upload_id dibuat server saat chunk pertama (crypto.randomUUID di browser butuh HTTPS).
      const uploadId = req.body?.upload_id ? String(req.body.upload_id) : randomUUID();
      await UploadsService.saveChunk(req.user!.id, uploadId, Number(req.body?.index), req.file.buffer);
      sendSuccess(res, { upload_id: uploadId }, 'Chunk tersimpan');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyimpan chunk file', 400);
    }
  }
}

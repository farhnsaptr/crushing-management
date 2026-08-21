import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { VerificationService } from './verification.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class VerificationController {
  /**
   * Get verification details & combined reuse material weights for date & shift.
   */
  static async getVerificationDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const date = (req.query.date as string) || new Date().toISOString().substring(0, 10);
      const shift = (req.query.shift as string) === 'Malam' ? 'Malam' : 'Pagi';

      const result = await VerificationService.getVerificationDetails(date, shift);
      sendSuccess(res, result, 'Detail verifikasi input & material reuse berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil detail verifikasi input', 500);
    }
  }

  /**
   * Save or Update input verification records (Header + Box Count Items).
   */
  static async saveVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { verification_date, shift, notes, items } = req.body;

      if (!verification_date || !shift || !Array.isArray(items)) {
        sendError(res, 'Parameter verification_date, shift, dan items wajib diisi dengan benar', 400);
        return;
      }

      const userId = req.user?.id || null;
      const userName = req.user?.full_name || req.user?.username || 'Operator';

      const result = await VerificationService.saveVerification(
        { verification_date, shift, notes, items },
        userId,
        userName
      );

      sendSuccess(res, result, 'Data verifikasi input hasil crushing berhasil disimpan & divalidasi');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyimpan data verifikasi input', 500);
    }
  }

  /**
   * Get Dashboard Verification Status indicator for date & shift.
   */
  static async getDashboardStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const shift = req.query.shift as string | undefined;

      const result = await VerificationService.getDashboardVerificationStatus(date, shift);
      sendSuccess(res, result, 'Status verifikasi dashboard berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil status verifikasi dashboard', 500);
    }
  }
}

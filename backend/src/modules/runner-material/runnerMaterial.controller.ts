import { Response } from 'express';
import { RunnerMaterialService } from './runnerMaterial.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class RunnerMaterialController {
  static async preview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { records } = req.body;
      if (!records || !Array.isArray(records)) {
        sendError(res, 'Payload `records` array wajib disediakan', 400);
        return;
      }

      const previewData = await RunnerMaterialService.previewImport(records);
      sendSuccess(res, previewData, 'Preview runner material berhasil dihitung');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menghitung preview runner material', 500);
    }
  }

  static async save(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { items, transaction_date, batch_ref } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        sendError(res, 'Daftar item runner material wajib diisi', 400);
        return;
      }

      if (!transaction_date) {
        sendError(res, 'Tanggal transaksi (transaction_date) wajib diisi', 400);
        return;
      }

      const result = await RunnerMaterialService.saveRecords(items, transaction_date, batch_ref);
      sendSuccess(res, result, 'Pencatatan runner material berhasil disimpan');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyimpan data runner material', 500);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await RunnerMaterialService.listRecords(page, limit, startDate, endDate);
      sendSuccess(res, result, 'Daftar riwayat runner material berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil riwayat runner material', 500);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date } = req.body;

      const result = await RunnerMaterialService.updateRecord(id, {
        material_name_snapshot,
        total_pcs,
        total_runner_weight_kg,
        transaction_date,
      });

      sendSuccess(res, result, 'Record runner material berhasil diperbarui');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal memperbarui record runner material', 500);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await RunnerMaterialService.deleteRecord(id);
      sendSuccess(res, result, 'Record runner material berhasil dihapus');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menghapus record runner material', 500);
    }
  }

  static async deleteAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await RunnerMaterialService.deleteAllRecords();
      sendSuccess(res, result, `Seluruh (${result.deletedCount}) data runner material berhasil dihapus`);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menghapus semua data runner material', 500);
    }
  }

  static async getAnalyticsSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

      const result = await RunnerMaterialService.getMaterialAnalyticsSummary(year, month);
      sendSuccess(res, result, 'Ringkasan analitik runner material berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil ringkasan analitik runner material', 500);
    }
  }

  static async getAnalyticsDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const materialName = (req.query.material_name as string) || '';
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

      if (!materialName) {
        sendError(res, 'Parameter `material_name` wajib diisi', 400);
        return;
      }

      const result = await RunnerMaterialService.getMaterialAnalyticsDetail(materialName, year);
      sendSuccess(res, result, 'Detail & tren bulanan runner material berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil detail analitik runner material', 500);
    }
  }
}



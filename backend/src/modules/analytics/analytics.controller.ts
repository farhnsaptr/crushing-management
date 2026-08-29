import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class AnalyticsController {
  /**
   * Preview production report CSV data and match against Master Parts.
   */
  static async previewProductionReport(req: Request, res: Response): Promise<void> {
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        sendError(res, 'Array data records laporan produksi wajib disertakan.', 400);
        return;
      }

      const result = await AnalyticsService.previewProductionReport({ records });
      sendSuccess(res, result, 'Preview analisis kecocokan data produksi berhasil diproses.');
    } catch (error: any) {
      console.error('Analytics Preview Error:', error);
      sendError(res, error.message || 'Gagal memproses preview laporan produksi.', 500);
    }
  }

  /**
   * Import production report CSV data.
   */
  static async importProductionReport(req: Request, res: Response): Promise<void> {
    try {
      const { filename, batch_name, records } = req.body;
      const user = (req as any).user;

      if (!filename || !Array.isArray(records) || records.length === 0) {
        sendError(res, 'File name dan array data records laporan produksi wajib disertakan.', 400);
        return;
      }

      const result = await AnalyticsService.importProductionReport(
        {
          filename,
          batch_name,
          records,
        },
        user?.id
      );

      sendSuccess(res, result, 'Data laporan produksi dan kalkulasi allowance berhasil diimpor.', 201);
    } catch (error: any) {
      console.error('Analytics Import Error:', error);
      sendError(res, error.message || 'Gagal mengimpor data laporan produksi.', 500);
    }
  }

  /**
   * Get yearly comparison analytics (12 months): Allowance vs Actual Output.
   */
  static async getYearlyComparison(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const factory = req.query.factory as string | undefined;

      const result = await AnalyticsService.getYearlyAnalytics(year, factory);
      sendSuccess(res, result, 'Data komparasi analitik tahunan berhasil dimuat.');
    } catch (error: any) {
      console.error('Yearly Comparison Error:', error);
      sendError(res, error.message || 'Gagal memuat komparasi analitik tahunan.', 500);
    }
  }

  /**
   * Get detailed paginated production analytics items.
   */
  static async getRecords(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const search = req.query.search as string | undefined;
      const factory = req.query.factory as string | undefined;

      const result = await AnalyticsService.getProductionRecords({
        page,
        limit,
        year,
        month,
        startDate,
        endDate,
        search,
        factory,
      });

      sendSuccess(res, result.records, 'Daftar rincian analitik produksi berhasil dimuat.', 200, result.pagination);
    } catch (error: any) {
      console.error('Analytics Records Error:', error);
      sendError(res, error.message || 'Gagal memuat rincian analitik produksi.', 500);
    }
  }

  /**
   * Get list of uploaded batches.
   */
  static async getBatches(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.getBatchesList();
      sendSuccess(res, result, 'Daftar batch upload laporan produksi berhasil dimuat.');
    } catch (error: any) {
      console.error('Analytics Batches Error:', error);
      sendError(res, error.message || 'Gagal memuat daftar batch upload.', 500);
    }
  }

  /**
   * Get Pareto Analysis for Materials
   */
  static async getParetoMaterials(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const factory = req.query.factory as string | undefined;

      const result = await AnalyticsService.getParetoMaterials(year, factory);
      sendSuccess(res, result, 'Data Pareto material berhasil dimuat.');
    } catch (error: any) {
      console.error('Pareto Materials Error:', error);
      sendError(res, error.message || 'Gagal memuat analisis Pareto material.', 500);
    }
  }

  /**
   * Get Pareto Analysis for Part NG
   */
  static async getParetoPartsNg(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const factory = req.query.factory as string | undefined;

      const result = await AnalyticsService.getParetoPartsNg(year, factory);
      sendSuccess(res, result, 'Data Pareto part NG berhasil dimuat.');
    } catch (error: any) {
      console.error('Pareto Parts NG Error:', error);
      sendError(res, error.message || 'Gagal memuat analisis Pareto part NG.', 500);
    }
  }

  /**
   * Rollback the most recently uploaded production batch.
   */
  static async rollbackLatestBatch(req: Request, res: Response): Promise<void> {
    try {
      const rolledBackBatch = await AnalyticsService.rollbackLatestBatch();
      if (!rolledBackBatch) {
        sendError(res, 'Tidak ada batch data produksi yang dapat di-rollback.', 404);
        return;
      }

      sendSuccess(
        res,
        rolledBackBatch,
        `Batch "${rolledBackBatch.filename}" (${rolledBackBatch.total_rows} baris) berhasil di-rollback.`
      );
    } catch (error: any) {
      console.error('Rollback Batch Error:', error);
      sendError(res, error.message || 'Gagal melakukan rollback batch data produksi.', 500);
    }
  }

  /**
   * Delete an uploaded batch.
   */
  static async deleteBatch(req: Request, res: Response): Promise<void> {
    try {
      const batchId = String(req.params.batchId || '');
      if (!batchId) {
        sendError(res, 'Batch ID wajib disertakan.', 400);
        return;
      }

      const success = await AnalyticsService.deleteBatch(batchId);
      if (!success) {
        sendError(res, 'Batch tidak ditemukan atau telah dihapus.', 404);
        return;
      }

      sendSuccess(res, { success: true }, 'Batch laporan produksi berhasil dihapus.');
    } catch (error: any) {
      console.error('Delete Batch Error:', error);
      sendError(res, error.message || 'Gagal menghapus batch laporan produksi.', 500);
    }
  }
}

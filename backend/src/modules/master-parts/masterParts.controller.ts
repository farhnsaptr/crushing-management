import { Response } from 'express';
import { MasterPartsService } from './masterParts.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class MasterPartsController {
  static async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const q = req.query.q as string;
      if (!q || q.trim() === '') {
        sendSuccess(res, [], 'Search query is empty');
        return;
      }

      const results = await MasterPartsService.searchParts(q.trim());
      sendSuccess(res, results, 'Search completed successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Search failed', 500);
    }
  }

  static async getModelsForPart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const partNumber = req.query.part_number as string;
      if (!partNumber || partNumber.trim() === '') {
        sendError(res, 'part_number query parameter is required', 400);
        return;
      }

      const results = await MasterPartsService.getModelsForPartNumber(partNumber.trim());
      sendSuccess(res, results, 'Models retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get models for part number', 500);
    }
  }

  static async getByQr(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const qr = req.query.qr as string;
      if (!qr || qr.trim() === '') {
        sendError(res, 'qr query parameter is required', 400);
        return;
      }

      const part = await MasterPartsService.getByQrCode(qr.trim());
      if (!part) {
        sendError(res, 'Part not found for given QR code', 404);
        return;
      }

      sendSuccess(res, part, 'Part retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get part by QR code', 500);
    }
  }

  static async getByJenis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const jenis = req.query.jenis as string;
      if (!jenis || jenis.trim() === '') {
        sendError(res, 'jenis query parameter is required', 400);
        return;
      }

      const results = await MasterPartsService.getPartsByJenis(jenis.trim());
      sendSuccess(res, results, 'Parts retrieved by jenis successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get parts by jenis', 500);
    }
  }

  static async listAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const jenis = (req.query.jenis as string) || '';

      const result = await MasterPartsService.listAllParts(page, limit, search, jenis);
      sendSuccess(res, result, 'Master parts list retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to list master parts', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        sebango_code,
        machine_id,
        customer,
        model_id,
        part_number,
        part_name,
        jenis_part,
        material,
        shikake,
        qty_day,
        prod_lot,
        qty_kbn,
        berat_part_gr,
        berat_runner_gr,
        image_url,
        qr_code_value,
      } = req.body;

      if (!sebango_code || !machine_id || !model_id || !part_number || !part_name || !berat_part_gr) {
        sendError(res, 'sebango_code, machine_id, model_id, part_number, part_name, and berat_part_gr are required', 400);
        return;
      }

      const part = await MasterPartsService.createPart({
        sebango_code,
        machine_id,
        customer: customer || '-',
        model_id,
        part_number,
        part_name,
        jenis_part: jenis_part || '-',
        material: material || '-',
        shikake,
        qty_day,
        prod_lot,
        qty_kbn,
        berat_part_gr,
        berat_runner_gr,
        image_url,
        qr_code_value,
      });

      sendSuccess(res, part, 'Master part created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create master part', 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id) {
        sendError(res, 'Invalid part ID', 400);
        return;
      }

      const part = await MasterPartsService.updatePart(id, req.body);
      sendSuccess(res, part, 'Master part updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update master part', 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id) {
        sendError(res, 'Invalid part ID', 400);
        return;
      }

      const result = await MasterPartsService.deletePart(id);
      sendSuccess(res, result, 'Master part deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete master part', 400);
    }
  }

  static async deleteAll(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await MasterPartsService.deleteAllParts();
      sendSuccess(res, result, `Seluruh data master parts (${result.deletedCount} items) berhasil dihapus`);
    } catch (error: any) {
      console.error('[DeleteAll MasterParts Error]', error);
      sendError(res, error.message || 'Gagal menghapus seluruh data master parts', 500);
    }
  }

  static async previewImport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file || !req.file.buffer) {
        sendError(res, 'File Excel wajib diunggah', 400);
        return;
      }

      const previewResult = await MasterPartsService.previewImportParts(req.file.buffer);
      sendSuccess(res, previewResult, 'Preview impor master parts berhasil diproses');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal memproses file Excel', 400);
    }
  }

  static async commitImport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        sendError(res, 'Data baris hasil preview wajib disertakan', 400);
        return;
      }

      const result = await MasterPartsService.commitImportParts(rows);
      sendSuccess(res, result, `Berhasil mengimpor ${result.insertedCount} master parts ke database`);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyimpan data impor ke database', 400);
    }
  }

  static async downloadTemplate(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const buffer = MasterPartsService.generateTemplateBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Template_Master_Parts.xlsx');
      res.send(buffer);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal membuat file template', 500);
    }
  }

  static async exportParts(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const buffer = await MasterPartsService.generateExportBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Export_Master_Parts.xlsx');
      res.send(buffer);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal melakukan ekspor data', 500);
    }
  }
}

import { Request, Response } from 'express';
import { MasterPartsService } from './masterParts.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class MasterPartsController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      if (!q.trim()) {
        sendSuccess(res, [], 'Search query is empty');
        return;
      }
      const results = await MasterPartsService.searchParts(q.trim());
      sendSuccess(res, results, 'Master parts search results');
    } catch (error: any) {
      sendError(res, error.message || 'Error searching master parts', 500);
    }
  }

  static async getModelsForPart(req: Request, res: Response): Promise<void> {
    try {
      const partNumber = (req.query.part_number as string) || '';
      if (!partNumber.trim()) {
        sendError(res, 'part_number query parameter is required', 400);
        return;
      }
      const models = await MasterPartsService.getModelsForPartNumber(partNumber.trim());
      sendSuccess(res, models, 'Models for part number retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching models for part number', 500);
    }
  }

  static async getByQr(req: Request, res: Response): Promise<void> {
    try {
      const qr = (req.query.qr as string) || '';
      if (!qr.trim()) {
        sendError(res, 'qr query parameter is required', 400);
        return;
      }
      const part = await MasterPartsService.getByQrCode(qr.trim());
      if (!part) {
        sendError(res, 'Part with QR code not found', 404);
        return;
      }
      sendSuccess(res, part, 'Part retrieved by QR code');
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching part by QR', 500);
    }
  }

  static async getByJenis(req: Request, res: Response): Promise<void> {
    try {
      const jenis = (req.query.jenis as string) || '';
      if (!jenis.trim()) {
        sendError(res, 'jenis query parameter is required', 400);
        return;
      }
      const parts = await MasterPartsService.getPartsByJenis(jenis.trim());
      sendSuccess(res, parts, 'Parts retrieved by jenis_part');
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching parts by jenis_part', 500);
    }
  }

  static async listAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await MasterPartsService.listAllParts(page, limit);
      sendSuccess(res, result.parts, 'Master parts list retrieved', 200, result.pagination);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching master parts list', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data.sebango_code || !data.part_number || !data.part_name || !data.berat_part_gr || !data.model_id || !data.machine_id || !data.customer || !data.jenis_part || !data.material) {
        sendError(res, 'Missing required master part fields (sebango_code, part_number, part_name, berat_part_gr, model_id, machine_id, customer, jenis_part, material)', 400);
        return;
      }
      const newPart = await MasterPartsService.createPart(data);
      sendSuccess(res, newPart, 'Master part created', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Error creating master part', 400);
    }
  }
}

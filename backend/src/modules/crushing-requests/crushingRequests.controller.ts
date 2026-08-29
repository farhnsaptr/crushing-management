import { Response } from 'express';
import { CrushingRequestsService } from './crushingRequests.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class CrushingRequestsController {
  static async createRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { shift, request_date, items, notes, request_type, factory_id, department_id } = req.body;

      if (!shift || !request_date || !items || !Array.isArray(items) || items.length === 0) {
        sendError(res, 'Shift, tanggal, dan minimal 1 item wajib diisi', 400);
        return;
      }

      const request = await CrushingRequestsService.createRequest(req.user, {
        shift,
        request_date,
        items,
        notes,
        request_type,
        factory_id,
        department_id,
      });

      sendSuccess(res, request, 'Tiket request pengiriman berhasil dibuat', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal membuat tiket request', 400);
    }
  }

  static async listRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { status, startDate, endDate, department_id, factory_id, search, page, limit } = req.query;

      const result = await CrushingRequestsService.listRequests(req.user, {
        status: status as any,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        department_id: department_id ? String(department_id) : undefined,
        factory_id: factory_id ? String(factory_id) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      sendSuccess(res, result, 'Daftar tiket request berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil daftar tiket request', 500);
    }
  }

  static async getRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const id = String(req.params.id);
      const request = await CrushingRequestsService.getRequestById(id, req.user);
      sendSuccess(res, request, 'Detail tiket request berhasil diambil');
    } catch (error: any) {
      const status = error.message && error.message.includes('Akses ditolak') ? 403 : 404;
      sendError(res, error.message || 'Gagal mengambil detail tiket request', status);
    }
  }

  static async approveRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const id = String(req.params.id);
      const { notes, items } = req.body;

      const updated = await CrushingRequestsService.approveRequest(id, req.user, { notes, items });
      sendSuccess(res, updated, 'Pengiriman berhasil diverifikasi, disetujui & disinkronkan ke sistem crushing');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyetujui pengiriman', 400);
    }
  }

  static async cancelRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const id = String(req.params.id);
      const result = await CrushingRequestsService.cancelRequest(id, req.user);
      sendSuccess(res, result, 'Pengiriman berhasil dibatalkan');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal membatalkan pengiriman', 400);
    }
  }

  static async getDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const draft = await CrushingRequestsService.getDraft(req.user.id);
      sendSuccess(res, draft, 'Draf tiket berhasil diambil');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal mengambil draf tiket', 500);
    }
  }

  static async saveDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const saved = await CrushingRequestsService.saveDraft(req.user, req.body);
      sendSuccess(res, saved, 'Draf tiket berhasil disimpan ke server');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menyimpan draf tiket', 500);
    }
  }

  static async deleteDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      await CrushingRequestsService.deleteDraft(req.user.id);
      sendSuccess(res, null, 'Draf tiket berhasil dihapus');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menghapus draf tiket', 500);
    }
  }
}

import { Response } from 'express';
import { MaterialsService } from './materials.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class MaterialsController {
  static async listAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';

      const result = await MaterialsService.listAllMaterials(page, limit, search);
      sendSuccess(res, result, 'Materials list retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to list materials', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const material = await MaterialsService.getMaterialById(id);
      if (!material) {
        sendError(res, 'Material not found', 404);
        return;
      }
      sendSuccess(res, material, 'Material details retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get material details', 500);
    }
  }

  static async getParts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await MaterialsService.getMaterialParts(id);
      sendSuccess(res, result, 'Material parts list retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get material parts', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { material_name, description, recycle_type } = req.body;
      if (!material_name || !material_name.trim()) {
        sendError(res, 'material_name is required', 400);
        return;
      }

      const material = await MaterialsService.createMaterial({ material_name, description, recycle_type });
      sendSuccess(res, material, 'Material created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create material', 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const material = await MaterialsService.updateMaterial(id, req.body);
      sendSuccess(res, material, 'Material updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update material', 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await MaterialsService.deleteMaterial(id);
      sendSuccess(res, result, 'Material deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete material', 400);
    }
  }

  static async deleteAll(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await MaterialsService.deleteAllMaterials();
      sendSuccess(res, result, `Seluruh data material (${result.deletedCount} items) berhasil dihapus`);
    } catch (error: any) {
      console.error('[DeleteAll Materials Error]', error);
      sendError(res, error.message || 'Gagal menghapus seluruh data material', 500);
    }
  }
}

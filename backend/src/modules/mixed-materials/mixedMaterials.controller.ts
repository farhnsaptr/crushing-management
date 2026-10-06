import { Response } from 'express';
import { MixedMaterialsService } from './mixedMaterials.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class MixedMaterialsController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await MixedMaterialsService.list((req.query.search as string) || '');
      sendSuccess(res, data, 'Mixed materials retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to list mixed materials', 500);
    }
  }

  static async getMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await MixedMaterialsService.getMembers(String(req.params.id));
      sendSuccess(res, data, 'Mixed material members retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get members', 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await MixedMaterialsService.create(req.body);
      sendSuccess(res, data, 'Mixed material created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create mixed material', 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await MixedMaterialsService.update(String(req.params.id), req.body);
      sendSuccess(res, data, 'Mixed material updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update mixed material', 400);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await MixedMaterialsService.remove(String(req.params.id));
      sendSuccess(res, data, 'Mixed material deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete mixed material', 400);
    }
  }
}

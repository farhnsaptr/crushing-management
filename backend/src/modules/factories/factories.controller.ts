import { Request, Response } from 'express';
import { FactoriesService } from './factories.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class FactoriesController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const factories = await FactoriesService.listFactories();
      sendSuccess(res, factories, 'Factories retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve factories', 500);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const factory = await FactoriesService.getFactoryById(id);
      if (!factory) {
        sendError(res, 'Factory not found', 404);
        return;
      }
      sendSuccess(res, factory, 'Factory retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve factory', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, location } = req.body;
      if (!code || !name) {
        sendError(res, 'Factory code and name are required', 400);
        return;
      }
      const factory = await FactoriesService.createFactory({ code, name, location });
      sendSuccess(res, factory, 'Factory created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create factory', 400);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { code, name, location } = req.body;
      const updated = await FactoriesService.updateFactory(id, { code, name, location });
      sendSuccess(res, updated, 'Factory updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update factory', 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await FactoriesService.deleteFactory(id);
      sendSuccess(res, result, 'Factory deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete factory', 400);
    }
  }
}

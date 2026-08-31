import { Response } from 'express';
import { SiteConfigService } from './siteConfig.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class SiteConfigController {
  static async getConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const config = await SiteConfigService.getConfig();
      sendSuccess(res, config, 'Site config retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve site config', 500);
    }
  }

  static async updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { items } = req.body;
      const userId = req.user ? req.user.id : 'system';

      if (!Array.isArray(items) || items.length === 0) {
        sendError(res, 'items array is required', 400);
        return;
      }

      const updatedConfig = await SiteConfigService.updateConfig(items, userId);
      sendSuccess(res, updatedConfig, 'Site config updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update site config', 400);
    }
  }

  static async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No file uploaded', 400);
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      sendSuccess(res, { url: fileUrl }, 'File uploaded successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to upload file', 500);
    }
  }
}

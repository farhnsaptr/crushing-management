import { Request, Response } from 'express';
import { SiteConfigService } from './siteConfig.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class SiteConfigController {
  static async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await SiteConfigService.getConfig();
      sendSuccess(res, config, 'Site configuration retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get site configuration', 500);
    }
  }

  static async updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings) || settings.length === 0) {
        sendError(res, 'Payload must include non-empty settings array [{key, value}]', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const updatedBy = req.user.id;
      const updatedConfig = await SiteConfigService.updateConfig(settings, updatedBy);
      sendSuccess(res, updatedConfig, 'Site configuration updated');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update site configuration', 400);
    }
  }
}

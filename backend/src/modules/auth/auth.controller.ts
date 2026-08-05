import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        sendError(res, 'Username and password are required', 400);
        return;
      }

      const result = await AuthService.login(username, password);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', 401);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    sendSuccess(res, req.user, 'Current user retrieved');
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    sendSuccess(res, null, 'Logged out successfully');
  }
}

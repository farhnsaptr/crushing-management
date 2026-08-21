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

    try {
      const freshUser = await AuthService.getFreshUserProfile(req.user.id);
      if (!freshUser) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(
        res,
        {
          id: freshUser.id,
          username: freshUser.username,
          full_name: freshUser.full_name,
          role: freshUser.role,
          factory_id: freshUser.factory_id || null,
          factory_name: freshUser.factory_name || null,
          department_id: freshUser.department_id || null,
          department_name: freshUser.department_name || null,
          last_login_at: freshUser.last_login_at || null,
        },
        'Current user retrieved'
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to retrieve current user', 500);
    }
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

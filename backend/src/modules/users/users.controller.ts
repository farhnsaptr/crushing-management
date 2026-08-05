import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class UsersController {
  static async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UsersService.listUsers();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve users', 500);
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, full_name, role } = req.body;

      if (!username || !password || !full_name || !role) {
        sendError(res, 'username, password, full_name, and role are required', 400);
        return;
      }

      if (!['admin', 'operator'].includes(role)) {
        sendError(res, 'Role must be admin or operator', 400);
        return;
      }

      const user = await UsersService.createUser({ username, password, full_name, role });
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create user', 400);
    }
  }

  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params.id);
      const { is_active } = req.body;

      if (!userId || typeof is_active !== 'boolean') {
        sendError(res, 'Invalid user ID or is_active value', 400);
        return;
      }

      const result = await UsersService.updateUserStatus(userId, is_active);
      sendSuccess(res, result, 'User status updated');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update user status', 400);
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params.id);
      if (!userId) {
        sendError(res, 'Invalid user ID', 400);
        return;
      }

      const result = await UsersService.deleteUser(userId);
      sendSuccess(res, result, 'User deleted');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete user', 400);
    }
  }
}

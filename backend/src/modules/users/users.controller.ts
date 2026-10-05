import { Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest, USER_ROLES } from '../../middlewares/auth.middleware';

export class UsersController {
  static async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const users = await UsersService.listUsers(currentUserId);
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve users', 500);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username, password, full_name, role, factory_id, department_id } = req.body;

      if (!username || !password || !full_name || !role) {
        sendError(res, 'username, password, full_name, and role are required', 400);
        return;
      }

      if (!USER_ROLES.includes(role)) {
        sendError(res, `Role must be one of: ${USER_ROLES.join(', ')}`, 400);
        return;
      }

      if (role === 'pengirim' && !department_id) {
        sendError(res, 'Role pengirim wajib memiliki department_id', 400);
        return;
      }

      const normalizedFactoryId = (factory_id === 'ALL' || !factory_id) ? null : factory_id;

      const user = await UsersService.createUser({
        username,
        password,
        full_name,
        role,
        factory_id: normalizedFactoryId,
        department_id: department_id || null,
      });
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create user', 400);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = String(req.params.id);
      const { full_name, role, factory_id, department_id, password } = req.body;

      if (!userId) {
        sendError(res, 'Invalid user ID', 400);
        return;
      }

      if (role && !USER_ROLES.includes(role)) {
        sendError(res, `Role must be one of: ${USER_ROLES.join(', ')}`, 400);
        return;
      }

      const normalizedFactoryId = factory_id === 'ALL' ? null : factory_id;

      const user = await UsersService.updateUser(userId, {
        full_name,
        role,
        factory_id: normalizedFactoryId,
        department_id,
        password,
      });
      sendSuccess(res, user, 'User updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update user', 400);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
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

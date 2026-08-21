import { Response } from 'express';
import { DepartmentsService } from './departments.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class DepartmentsController {
  static async listDepartments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const departments = await DepartmentsService.listDepartments();
      sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve departments', 500);
    }
  }

  static async getDepartmentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const department = await DepartmentsService.getDepartmentById(id);
      if (!department) {
        sendError(res, 'Department not found', 404);
        return;
      }
      sendSuccess(res, department, 'Department retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve department', 500);
    }
  }

  static async createDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code, name, description } = req.body;

      if (!code || !name) {
        sendError(res, 'Kode dan nama departemen wajib diisi', 400);
        return;
      }

      const department = await DepartmentsService.createDepartment({ code, name, description });
      sendSuccess(res, department, 'Departemen berhasil ditambahkan', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menambahkan departemen', 400);
    }
  }

  static async updateDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { code, name, description } = req.body;

      const updated = await DepartmentsService.updateDepartment(id, { code, name, description });
      sendSuccess(res, updated, 'Departemen berhasil diperbarui');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal memperbarui departemen', 400);
    }
  }

  static async deleteDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await DepartmentsService.deleteDepartment(id);
      sendSuccess(res, result, 'Departemen berhasil dihapus');
    } catch (error: any) {
      sendError(res, error.message || 'Gagal menghapus departemen', 400);
    }
  }
}

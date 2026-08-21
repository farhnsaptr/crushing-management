import { Router } from 'express';
import { DepartmentsController } from './departments.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// Read operations accessible to all authenticated users
router.get('/', verifyToken, DepartmentsController.listDepartments);
router.get('/:id', verifyToken, DepartmentsController.getDepartmentById);

// Master Data CRUD accessible to admin and super-admin
router.post('/', verifyToken, requireRole(['super-admin', 'admin']), DepartmentsController.createDepartment);
router.put('/:id', verifyToken, requireRole(['super-admin', 'admin']), DepartmentsController.updateDepartment);
router.delete('/:id', verifyToken, requireRole(['super-admin', 'admin']), DepartmentsController.deleteDepartment);

export default router;

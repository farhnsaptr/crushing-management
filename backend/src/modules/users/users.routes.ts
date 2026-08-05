import { Router } from 'express';
import { UsersController } from './users.controller';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken, requireRole(['admin']));

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all registered users excluding currently logged-in user (Admin only)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user account (Admin only)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, full_name, role]
 *             properties:
 *               username: { type: string, description: "Username unik akun" }
 *               password: { type: string, description: "Password akun" }
 *               full_name: { type: string, description: "Nama lengkap pengguna" }
 *               role: { type: string, enum: [admin, operator], description: "Role akses akun (admin/operator)" }
 *     responses:
 *       201:
 *         description: User created
 */
router.get('/', UsersController.listUsers);
router.post('/', UsersController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update user account details (Admin only)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID pengguna (UUID)" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string, description: "Nama lengkap baru" }
 *               role: { type: string, enum: [admin, operator], description: "Role akses baru" }
 *               password: { type: string, description: "Password baru (opsional)" }
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete a user account (Admin only)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID pengguna (UUID)" }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.put('/:id', UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);

/**
 * @openapi
 * /api/users/{id}/status:
 *   put:
 *     summary: Activate or deactivate a user account (Admin only)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, description: "ID pengguna (UUID)" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active: { type: boolean, description: "Status keaktifan akun (true/false)" }
 *     responses:
 *       200:
 *         description: User status updated
 */
router.put('/:id/status', UsersController.updateUserStatus);

export default router;

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifyToken, preventReLogin } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user & issue JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, description: "Username akun pengguna" }
 *               password: { type: string, description: "Password akun pengguna" }
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Already authenticated or missing fields
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', authLimiter, preventReLogin, AuthController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get profile of currently logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', verifyToken, AuthController.me);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Clear auth cookie and logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', verifyToken, AuthController.logout);

export default router;

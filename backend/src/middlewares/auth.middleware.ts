import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { sendError } from '../utils/response.util';

export const USER_ROLES = ['super-admin', 'admin', 'operator', 'pengirim', 'guest'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Role 'guest' = viewer murni: hanya boleh request yang tidak mengubah data.
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export interface JwtPayloadUser {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  factory_id?: string | null;
  factory_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadUser;
}

export function getLockedFactoryId(user?: JwtPayloadUser): string | undefined {
  return user?.role === 'pengirim' && user.factory_id && user.factory_id !== 'ALL'
    ? user.factory_id
    : undefined;
}

/** Hanya memverifikasi token & mengisi req.user (tanpa pembatasan role). */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    sendError(res, 'Access denied. No token provided.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadUser;
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token.', 401);
  }
}

/** authenticate + guard read-only: role guest ditolak (403) untuk method yang mengubah data. */
export function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  authenticate(req, res, () => {
    if (req.user?.role === 'guest' && !SAFE_METHODS.includes(req.method)) {
      sendError(res, 'Forbidden. Akun guest hanya dapat melihat data.', 403);
      return;
    }
    next();
  });
}

export function preventReLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      jwt.verify(token, env.JWT_SECRET);
      sendError(res, 'Already authenticated. Please logout before logging in again.', 400);
      return;
    } catch (error) {
      // Invalid/expired token, allow user to log in again
    }
  }

  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Forbidden. Insufficient permissions.', 403);
      return;
    }

    next();
  };
}

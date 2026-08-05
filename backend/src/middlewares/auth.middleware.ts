import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { sendError } from '../utils/response.util';

export interface JwtPayloadUser {
  id: string;
  username: string;
  full_name: string;
  role: 'super-admin' | 'admin' | 'operator';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadUser;
}

export function verifyToken(
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

export function requireRole(allowedRoles: ('super-admin' | 'admin' | 'operator')[]) {
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

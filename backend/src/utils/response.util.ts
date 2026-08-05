import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: ApiResponse['pagination']
): Response {
  const body: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400
): Response {
  const body: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(body);
}

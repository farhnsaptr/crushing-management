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
  let userFriendlyError = error || 'Terjadi kesalahan pada sistem';

  if (typeof error === 'string') {
    if (error.includes('ER_DUP_ENTRY') || error.includes('Duplicate entry')) {
      userFriendlyError = 'Data yang dimasukkan sudah terdaftar di sistem.';
    } else if (error.includes('a foreign key constraint fails') || error.includes('foreign key constraint fails')) {
      userFriendlyError = 'Data berelasi tidak ditemukan atau masih digunakan oleh data lain.';
    } else if (error.includes('Data truncated') || error.includes('Incorrect integer value') || error.includes('Incorrect decimal value')) {
      userFriendlyError = 'Format input data tidak valid.';
    } else if (error.includes('ECONNREFUSED')) {
      userFriendlyError = 'Gagal terhubung ke server database.';
    }
  }

  const body: ApiResponse = {
    success: false,
    error: userFriendlyError,
    message: userFriendlyError,
  };
  return res.status(statusCode).json(body);
}

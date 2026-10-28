import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import { CrussingApiError } from './crussing.client';
import { getCrussingStatus, getUnmatchedSebangos, syncCrussing } from './crussingSync.service';

function handleError(res: Response, error: unknown): void {
 if (error instanceof CrussingApiError) {
 sendError(res, error.message, error.httpStatus);
 return;
 }

 console.error('[CrussingSync] Error:', error);
 sendError(res, (error as Error)?.message || 'Gagal memproses sinkronisasi Crusing API.', 500);
}

export class CrussingSyncController {
 static async sync(req: AuthenticatedRequest, res: Response): Promise<void> {
 try {
 const { location, year, month } = req.body || {};

 if (!location || year === undefined || year === null || year === '') {
 sendError(res, 'location dan year wajib diisi.', 400);
 return;
 }

 const data = await syncCrussing(
 String(location),
 Number(year),
 month === undefined || month === null || month === '' ? undefined : Number(month),
 req.user?.id
 );

 sendSuccess(res, data, 'Sinkronisasi Crusing API berhasil.');
 } catch (error) {
 handleError(res, error);
 }
 }

 static async getStatus(req: Request, res: Response): Promise<void> {
 try {
 const location = String(req.query.location || '');
 const year = Number(req.query.year);
 const monthParam = req.query.month;
 const month = monthParam === undefined || monthParam === '' ? undefined : Number(monthParam);

 if (!location || !Number.isInteger(year)) {
 sendError(res, 'location dan year wajib diisi.', 400);
 return;
 }

 const data = await getCrussingStatus(location, year, month);
 sendSuccess(res, data, 'Status sinkronisasi Crusing API.');
 } catch (error) {
 handleError(res, error);
 }
 }

 static async getUnmatchedSebangos(req: Request, res: Response): Promise<void> {
 try {
 const location = String(req.query.location || '');
 const year = Number(req.query.year);
 const monthParam = req.query.month;
 const month = monthParam === undefined || monthParam === '' ? undefined : Number(monthParam);

 if (!location || !Number.isInteger(year)) {
 sendError(res, 'location dan year wajib diisi.', 400);
 return;
 }

 const data = await getUnmatchedSebangos(location, year, month);
 sendSuccess(res, data, 'Daftar SEBANGO tidak cocok dari Crusing API.');
 } catch (error) {
 handleError(res, error);
 }
 }
}

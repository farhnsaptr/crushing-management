import { env } from '../../config/env.config';

export interface CrussingBudomariRecord {
 sebango: string;
 shift: string;
 date: string;
 factory?: string | null;
 machine_no?: string | null;
 tonnage?: string | null;
 part_no?: string | null;
 material_name?: string | null;
 reuse_flag?: string | null;
 act_total_pcs?: number | null;
 act_ok_pcs?: number | null;
 ng_total_pcs?: number | null;
 ok_use_pct?: number | null;
 ng_loss_pct?: number | null;
 runner_pct?: number | null;
 dango_pct?: number | null;
 dango_part_pct?: number | null;
}

interface AuthResponse {
 success?: boolean;
 access_token?: string;
 token_type?: string;
 expires_in?: number;
 error?: string;
 message?: string;
}

interface BudomariResponse {
 success?: boolean;
 data?: CrussingBudomariRecord[];
 error?: string;
 message?: string;
}

export class CrussingApiError extends Error {
 constructor(
 message: string,
 public httpStatus: number = 502,
 public upstreamStatus?: number
 ) {
 super(message);
 this.name = 'CrussingApiError';
 }
}

let tokenCache: { token: string; expiresAt: number } | null = null;
let inflightAuth: Promise<string> | null = null;

function baseUrl(): string {
 const base = (env.CRUSSING_API_BASE_URL || '').replace(/\/+$/, '');
 if (!base) {
 throw new CrussingApiError('CRUSSING_API_BASE_URL belum dikonfigurasi.', 500);
 }
 return base;
}

function timeoutMs(): number {
 return Number.isFinite(env.CRUSSING_API_TIMEOUT_MS) && env.CRUSSING_API_TIMEOUT_MS > 0
 ? env.CRUSSING_API_TIMEOUT_MS
 : 60000;
}

function errorMessage(body: any, status: number): string {
 if (body?.error) return String(body.error);
 if (body?.message) return String(body.message);
 if (status === 401) return 'Autentikasi ke Crusing API gagal (token tidak valid).';
 if (status === 403) return 'Akun integrasi Crusing API dinonaktifkan.';
 if (status === 422) return 'Validasi parameter Crusing API gagal.';
 if (status === 429) return 'Batas request Crusing API tercapai. Coba lagi beberapa saat.';
 if (status >= 500) return 'Crusing API sedang mengalami gangguan.';
 return `Crusing API mengembalikan status ${status}.`;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), timeoutMs());

 try {
 const response = await fetch(`${baseUrl()}${path}`, {
 ...options,
 signal: controller.signal,
 headers: {
 Accept: 'application/json',
 'Content-Type': 'application/json',
 ...(options.headers || {}),
 },
 });

 const text = await response.text();
 let body: any = null;
 if (text) {
 try {
 body = JSON.parse(text);
 } catch {
 body = null;
 }
 }

 if (!response.ok) {
 throw new CrussingApiError(
 errorMessage(body, response.status),
 response.status === 429 ? 429 : 502,
 response.status
 );
 }

 return body as T;
 } catch (error) {
 if (error instanceof CrussingApiError) throw error;
 if ((error as Error).name === 'AbortError') {
 throw new CrussingApiError('Timeout menghubungi Crusing API.', 504);
 }
 throw new CrussingApiError(`Tidak dapat terhubung ke Crusing API: ${(error as Error).message}`, 502);
 } finally {
 clearTimeout(timer);
 }
}

async function authenticate(): Promise<string> {
 if (!env.CRUSSING_API_CLIENT_ID || !env.CRUSSING_API_CLIENT_SECRET) {
 throw new CrussingApiError('Kredensial Crusing API belum dikonfigurasi.', 500);
 }

 const body = await request<AuthResponse>('/auth', {
 method: 'POST',
 body: JSON.stringify({
 client_id: env.CRUSSING_API_CLIENT_ID,
 client_secret: env.CRUSSING_API_CLIENT_SECRET,
 }),
 });

 if (!body?.access_token) {
 throw new CrussingApiError('Respons auth Crusing API tidak berisi access_token.', 502);
 }

 const ttlSeconds = Math.max(60, Number(body.expires_in) || 3600);
 tokenCache = {
 token: body.access_token,
 // Simpan margin 5 menit agar token tidak kadaluarsa di tengah request.
 expiresAt: Date.now() + Math.max(0, ttlSeconds - 300) * 1000,
 };
 return body.access_token;
}

async function getToken(force = false): Promise<string> {
 if (!force && tokenCache && tokenCache.expiresAt > Date.now()) {
 return tokenCache.token;
 }

 if (!inflightAuth) {
 inflightAuth = authenticate().finally(() => {
 inflightAuth = null;
 });
 }
 return inflightAuth;
}

function extractData(body: BudomariResponse | null): CrussingBudomariRecord[] {
 if (!body || body.success !== true) {
 throw new CrussingApiError(body?.error || body?.message || 'Respons Crusing API tidak valid.', 502);
 }
 // API mengembalikan [] untuk periode kosong; null diperlakukan sama agar aman.
 return Array.isArray(body.data) ? body.data : [];
}

export async function fetchBudomari(
 location: string,
 dateFrom: string,
 dateTo: string
): Promise<CrussingBudomariRecord[]> {
 const call = async (token: string) => request<BudomariResponse>('/budomari', {
 method: 'POST',
 headers: { Authorization: `Bearer ${token}` },
 body: JSON.stringify({ location, date_from: dateFrom, date_to: dateTo }),
 });

 let token = await getToken();

 try {
 return extractData(await call(token));
 } catch (error) {
 // Token bisa saja di-invalidasi oleh proses lain yang memakai client_id yang sama.
 if (error instanceof CrussingApiError && error.upstreamStatus === 401) {
 token = await getToken(true);
 return extractData(await call(token));
 }
 throw error;
 }
}

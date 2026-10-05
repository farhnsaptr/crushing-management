import fs from 'fs/promises';
import os from 'os';
import path from 'path';

// Sengaja di temp OS, bukan di `uploads/` yang disajikan publik oleh express.static.
const TMP_DIR = path.join(os.tmpdir(), 'crushing-chunked-uploads');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Batas total ukuran file hasil rakitan (samakan dengan limit multer terbesar di modul import). */
export const MAX_ASSEMBLED_FILE_BYTES = 25 * 1024 * 1024;
/** Batas ukuran per-chunk — harus di bawah client_max_body_size nginx produksi (1MB). */
export const MAX_CHUNK_BYTES = 1024 * 1024;
/** Batas jumlah chunk per upload (mencegah disk dibanjiri satu upload_id). */
const MAX_CHUNK_COUNT = 100;
const STALE_UPLOAD_MS = 60 * 60 * 1000;

/**
 * Chunked upload: file besar dipotong frontend menjadi beberapa request kecil (< 1MB)
 * agar lolos limit body nginx, lalu dirakit kembali di sini menjadi satu Buffer.
 */
export class UploadsService {
  /** Folder chunk diberi prefix user id agar user lain tidak bisa memakai upload_id milik orang lain. */
  private static resolveDir(userId: string, uploadId: string): string {
    if (!UUID_PATTERN.test(uploadId)) {
      throw new Error('upload_id tidak valid');
    }
    return path.join(TMP_DIR, `${userId}_${uploadId}`);
  }

  static async saveChunk(userId: string, uploadId: string, index: number, buffer: Buffer): Promise<void> {
    if (!Number.isInteger(index) || index < 0 || index >= MAX_CHUNK_COUNT) {
      throw new Error('Index chunk tidak valid');
    }
    const dir = this.resolveDir(userId, uploadId);

    if (index === 0) {
      this.removeStaleUploads().catch((err) => console.warn('[UploadsService] Stale cleanup gagal:', err));
    }

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, String(index).padStart(5, '0')), buffer);
  }

  static async assemble(userId: string, uploadId: string, totalChunks: number): Promise<Buffer> {
    const dir = this.resolveDir(userId, uploadId);
    if (!Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > MAX_CHUNK_COUNT) {
      throw new Error('Jumlah chunk (total_chunks) tidak valid');
    }

    const parts = await fs.readdir(dir).catch(() => [] as string[]);
    if (parts.length !== totalChunks) {
      throw new Error(`File belum lengkap terunggah (${parts.length}/${totalChunks} bagian). Silakan unggah ulang.`);
    }

    // Nama file chunk di-pad 5 digit, jadi sort leksikografis = urutan index.
    const buffers = await Promise.all(parts.sort().map((p) => fs.readFile(path.join(dir, p))));
    const file = Buffer.concat(buffers);
    if (file.length > MAX_ASSEMBLED_FILE_BYTES) {
      throw new Error('Ukuran file melebihi batas maksimum 25MB');
    }
    return file;
  }

  static async remove(userId: string, uploadId: string): Promise<void> {
    await fs.rm(this.resolveDir(userId, uploadId), { recursive: true, force: true });
  }

  // ponytail: dibersihkan oportunistik saat ada upload baru, bukan cron; tambah job terjadwal kalau disk tmp mulai penuh.
  private static async removeStaleUploads(): Promise<void> {
    const entries = await fs.readdir(TMP_DIR).catch(() => [] as string[]);
    const now = Date.now();
    await Promise.all(
      entries.map(async (name) => {
        const full = path.join(TMP_DIR, name);
        const stat = await fs.stat(full).catch(() => null);
        if (stat && now - stat.mtimeMs > STALE_UPLOAD_MS) {
          await fs.rm(full, { recursive: true, force: true });
        }
      })
    );
  }
}

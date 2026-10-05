import { apiClient } from './api.client';

/** Ukuran per-chunk: harus di bawah limit body nginx produksi (1MB) + overhead multipart. */
const CHUNK_SIZE_BYTES = 768 * 1024;

/** Referensi file yang sudah diunggah per-chunk; kirim sebagai body ke endpoint preview/import. */
export interface ChunkedUploadRef {
  upload_id: string;
  total_chunks: number;
  filename: string;
}

/**
 * Upload file besar per-chunk ke POST /api/uploads/chunk agar tiap request < 1MB.
 * Backend merakit ulang chunk saat endpoint tujuan menerima `upload_id`.
 */
export async function uploadFileInChunks(file: File): Promise<ChunkedUploadRef> {
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));
  let uploadId = '';

  for (let index = 0; index < totalChunks; index++) {
    const formData = new FormData();
    if (uploadId) formData.append('upload_id', uploadId);
    formData.append('index', String(index));
    formData.append('chunk', file.slice(index * CHUNK_SIZE_BYTES, (index + 1) * CHUNK_SIZE_BYTES), file.name);

    const response = await apiClient.post<{ success: boolean; data: { upload_id: string } }>(
      '/api/uploads/chunk',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    uploadId = response.data.data.upload_id;
  }

  return { upload_id: uploadId, total_chunks: totalChunks, filename: file.name };
}

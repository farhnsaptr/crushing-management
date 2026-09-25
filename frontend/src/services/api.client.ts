import axios from 'axios';
import { getApiBaseUrl } from '../config/env.config';

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Automatically sends and receives HTTP-Only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Dynamic baseURL if configured
apiClient.interceptors.request.use(
  (config) => {
    const configuredBase = getApiBaseUrl();
    if (configuredBase && !config.baseURL) {
      config.baseURL = configuredBase;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Unauthorized handling & error message normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Cookie session invalid or expired
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Normalisasi error.message agar tidak mentah menampilkan "Request failed with status code ..."
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage && typeof serverMessage === 'string' && serverMessage.trim() !== '') {
      error.message = serverMessage;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Permintaan waktu habis (timeout). Silakan periksa koneksi Anda.';
    } else if (error.message === 'Network Error' || !error.response) {
      error.message = 'Gagal terhubung ke server. Periksa koneksi jaringan internet Anda.';
    } else if (error.response?.status === 400) {
      error.message = 'Data permintaan tidak valid atau field wajib belum lengkap.';
    } else if (error.response?.status === 403) {
      error.message = 'Anda tidak memiliki hak akses untuk tindakan ini.';
    } else if (error.response?.status === 404) {
      error.message = 'Data yang diminta tidak ditemukan.';
    } else if (error.response?.status >= 500) {
      error.message = 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
    }

    return Promise.reject(error);
  }
);

/**
 * Utility helper to safely extract user-friendly error message from any error object.
 */
export function extractErrorMessage(err: unknown, fallbackMessage: string = 'Terjadi kesalahan pada sistem'): string {
  if (!err) return fallbackMessage;

  if (typeof err === 'string' && err.trim() !== '') return err;

  const anyErr = err as any;
  const serverMsg = anyErr.response?.data?.message || anyErr.response?.data?.error;
  if (serverMsg && typeof serverMsg === 'string' && serverMsg.trim() !== '') {
    return serverMsg;
  }

  const clientMsg = anyErr.message;
  if (clientMsg && typeof clientMsg === 'string' && clientMsg.trim() !== '') {
    if (
      clientMsg.includes('Request failed with status code') ||
      clientMsg.includes('AxiosError') ||
      clientMsg.includes('status code 400') ||
      clientMsg.includes('status code 500') ||
      clientMsg.includes('Network Error')
    ) {
      if (anyErr.response?.status === 400) {
        return 'Data permintaan tidak valid atau field wajib belum lengkap.';
      }
      if (anyErr.response?.status === 403) {
        return 'Anda tidak memiliki hak akses untuk tindakan ini.';
      }
      if (anyErr.response?.status === 404) {
        return 'Data tidak ditemukan.';
      }
      if (anyErr.response?.status >= 500) {
        return 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
      }
      if (clientMsg.includes('Network Error')) {
        return 'Gagal terhubung ke server. Periksa koneksi jaringan Anda.';
      }
      return fallbackMessage;
    }
    return clientMsg;
  }

  return fallbackMessage;
}

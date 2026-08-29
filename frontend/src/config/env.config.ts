/**
 * Dynamic API Base URL resolver:
 * 1. Prioritizes VITE_API_BASE_URL from environment (e.g. 'https://api.domain.com', 'http://172.19.85.141:4000', or '/api').
 * 2. If empty/unset, defaults to relative path (empty string '') so requests automatically use current origin and proxy.
 */
export const getApiBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim() !== '') {
    return envBaseUrl.trim();
  }

  // When served via proxy (Vite dev/preview, Nginx, Caddy), relative path is same-origin
  return '';
};

export const env = {
  get API_BASE_URL(): string {
    return getApiBaseUrl();
  },
};

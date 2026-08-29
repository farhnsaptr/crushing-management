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

// Response Interceptor: Global 401 Unauthorized handling
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
    return Promise.reject(error);
  }
);

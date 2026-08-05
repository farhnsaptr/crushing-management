import axios from 'axios';
import { env } from '../config/env.config';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true, // Automatically sends and receives HTTP-Only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Global 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired in HTTP-Only Cookie
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// api.js
import axios from 'axios';
import { authService } from './services/authService';

const api = axios.create({
  baseURL: 'https://localhost:7155/api',
  withCredentials: true, // cookie HttpOnly
});

// gắn accessToken
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// xử lý 401 → refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await authService.refreshToken();

        if (res.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        authService.logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

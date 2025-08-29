// api.js
import axios from 'axios';
import { authService } from './services/authService';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // cookie HttpOnly
});

// Request interceptor -> gắn accessToken
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor -> xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛑 Network Error (server tắt / không kết nối được)
    if (error.message === 'Network Error' && !error.response) {
      if (!originalRequest._networkHandled) {
        originalRequest._networkHandled = true; // tránh toast nhiều lần
        toast.error('Không thể kết nối tới server, vui lòng thử lại sau!');
        console.warn('API unreachable'); // chỉ log ngắn gọn, không log URL
      }
      return Promise.reject({ ...error, handled: true });
    }

    // 🛑 401 Unauthorized → thử refresh token
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

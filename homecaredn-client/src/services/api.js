/* sonarjs ignore file */
import axios from 'axios';
import { authService } from './auth/authService';
import { toast } from 'react-toastify';
import { navigateTo } from '../utils/navigateHelper';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  }
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 🟧 403 Forbidden → Không có quyền
    if (error.response?.status === 403 && !originalRequest._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error('Bạn không có quyền truy cập trang này!');
      navigateTo('/Unauthorized');
      return error;
    }
    if (error.response?.status === 404 && !originalRequest._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      navigateTo('/NotFound');
      return error;
    }
    // Network Error
    if (error.message === 'Network Error' && !error.response) {
      if (!originalRequest._networkHandled) {
        originalRequest._networkHandled = true;
        toast.error('Không thể kết nối tới server, vui lòng thử lại sau!');
      }
      error.handled = true;
      throw error;
    }

    // 401 Unauthorized → refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await authService.refreshToken();
        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (err) {
        processQueue(err, null);
        authService.logout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

export default api;

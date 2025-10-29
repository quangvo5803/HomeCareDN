/* sonarjs ignore file */
import axios from 'axios';
import { authService } from '../authService';
import { toast } from 'react-toastify';
import { navigateTo } from '../../utils/navigateHelper';
import i18n from '../../configs/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// 🟢 Network error spam lock
let networkErrorToastId = null;
let isShowingNetworkError = false;

const processQueue = (error, token = null) => {
  for (const prom of failedQueue) {
    if (error) prom.reject(error);
    else prom.resolve(token);
  }
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // ✅ Hide toast when server reconnects
    if (isShowingNetworkError && networkErrorToastId) {
      toast.dismiss(networkErrorToastId);
      isShowingNetworkError = false;
      networkErrorToastId = null;

      // Optional: show reconnection success
      toast.success(i18n.t('SUCCESS.RECONNECTED'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 🟧 403 Forbidden
    if (error.response?.status === 403 && !originalRequest._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error(i18n.t('ERROR.FORBIDDEN'));
      navigateTo('/Unauthorized');
      return error;
    }

    // 🟧 404 Not Found
    if (error.response?.status === 404 && !originalRequest._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error(i18n.t('ERROR.NOT_FOUND'));
      navigateTo('/NotFound');
      return error;
    }

    // 🔴 Network Error (server unreachable)
    if (error.message === 'Network Error' && !error.response) {
      if (!isShowingNetworkError) {
        isShowingNetworkError = true; // lock to avoid spam
        networkErrorToastId = toast.error(i18n.t('ERROR.NETWORK_UNREACHABLE'));
      }
      error._handledByInterceptor = true; // 🟢 mark as handled (for handleApiError)
      throw error;
    }

    // 🟡 401 Unauthorized → refresh token
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
        return Promise.resolve();
      } finally {
        isRefreshing = false;
      }
    }
    if (error.response?.status === 401 && error.config?._retry) {
      return Promise.resolve();
    }
    throw error;
  }
);

export default api;

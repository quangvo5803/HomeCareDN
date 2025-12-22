/* sonarjs ignore file */
import axios from 'axios';
import { authService } from '../authService';
import { toast } from 'react-toastify';
import { navigateTo } from '../../utils/navigateHelper';
import i18n from '../../configs/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  timeout: 300000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// 🟢 Network error spam lock
let networkErrorToastId = null;
let isShowingNetworkError = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    // ✅ Server reconnected
    if (isShowingNetworkError && networkErrorToastId) {
      toast.dismiss(networkErrorToastId);
      isShowingNetworkError = false;
      networkErrorToastId = null;
      toast.success(i18n.t('SUCCESS.RECONNECTED'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    /* 🟧 403 Forbidden */
    if (error.response?.status === 403 && !originalRequest?._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error(i18n.t('ERROR.FORBIDDEN'));
      navigateTo('/Unauthorized');
      throw error;
    }

    /* 🟧 404 Not Found */
    if (error.response?.status === 404 && !originalRequest?._notFoundHandled) {
      originalRequest._notFoundHandled = true;
      toast.error(i18n.t('ERROR.NOT_FOUND'));
      navigateTo('/NotFound');
      throw error;
    }

    /* 🔴 Network Error */
    if (error.message === 'Network Error' && !error.response) {
      if (!isShowingNetworkError) {
        isShowingNetworkError = true;
        networkErrorToastId = toast.error(i18n.t('ERROR.NETWORK_UNREACHABLE'));
      }
      throw error;
    }

    /* 🟡 401 Unauthorized → Refresh token */
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
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
        const newAccessToken = res?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh token failed');
        }

        localStorage.setItem('accessToken', newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
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

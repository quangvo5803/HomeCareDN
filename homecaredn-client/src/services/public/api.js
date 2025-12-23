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

// 🔒 Lock toast to avoid spam
let networkErrorToastId = null;
let isShowingNetworkError = false;
let isLoggingOut = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ Force logout function
const forceLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // Clear token
  localStorage.removeItem('accessToken');

  // ✅ Dispatch event to AuthProvider
  window.dispatchEvent(new Event('auth:force-logout'));

  // Show toast once
  toast.error(i18n.t('ERROR.SESSION_EXPIRED'));

  // Clear all pending requests
  failedQueue = [];
  isRefreshing = false;

  // Navigate to login
  setTimeout(() => {
    navigateTo('/Login');
  }, 100);
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    if (isLoggingOut) {
      return Promise.reject(
        new axios.Cancel('Session expired, redirecting to login')
      );
    }

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
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    /* 🟧 403 Forbidden */
    if (error.response?.status === 403 && !originalRequest?._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error(i18n.t('ERROR.FORBIDDEN'));
      navigateTo('/Unauthorized');
      return Promise.reject(error);
    }

    /* 🟧 404 Not Found */
    if (error.response?.status === 404 && !originalRequest?._notFoundHandled) {
      originalRequest._notFoundHandled = true;
      toast.error(i18n.t('ERROR.NOT_FOUND'));
      navigateTo('/NotFound');
      return Promise.reject(error);
    }

    /* 🔴 Network Error */
    if (error.message === 'Network Error' && !error.response) {
      if (!isShowingNetworkError) {
        isShowingNetworkError = true;
        networkErrorToastId = toast.error(i18n.t('ERROR.NETWORK_UNREACHABLE'));
      }
      return Promise.reject(error);
    }

    /* 🟡 401 Unauthorized → Refresh token */
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // ✅ Token expired → force logout immediately
      if (error.response?.data?.errorCode === 'LOGIN_TOKEN_EXPIRED') {
        forceLogout();
        return Promise.reject(error);
      }

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

      isRefreshing = true;

      try {
        const res = await authService.refreshToken();
        const newAccessToken = res?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh token failed');
        }

        localStorage.setItem('accessToken', newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        forceLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

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

// 🟢 Session expired spam lock
let isSessionExpired = false;

const processQueue = (error, token = null) => {
  for (const prom of failedQueue) {
    if (error) prom.reject(error);
    else prom.resolve(token);
  }
  failedQueue = [];
};

// 🟢 Dispatch custom event for Provider to handle logout
const triggerSessionExpired = () => {
  if (isSessionExpired) return; // Already triggered

  isSessionExpired = true;

  // Clear tokens locally
  authService.clearSession();

  // Show toast once
  toast.error(i18n.t('ERROR.SESSION_EXPIRED'), {
    toastId: 'session-expired', // Prevent duplicates
  });

  // Dispatch event for AuthProvider to catch
  window.dispatchEvent(new CustomEvent('session-expired'));

  // Reset flag after 2s
  setTimeout(() => {
    isSessionExpired = false;
  }, 2000);
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
      toast.success(i18n.t('SUCCESS.RECONNECTED'), {
        toastId: 'reconnected',
      });
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
      return Promise.reject(error);
    }

    // 🟧 404 Not Found
    if (error.response?.status === 404 && !originalRequest._notFoundHandled) {
      originalRequest._notFoundHandled = true;
      toast.error(i18n.t('ERROR.NOT_FOUND'));
      navigateTo('/NotFound');
      return Promise.reject(error);
    }

    // 🔴 Network Error (server unreachable)
    if (error.message === 'Network Error' && !error.response) {
      if (!isShowingNetworkError) {
        isShowingNetworkError = true;
        networkErrorToastId = toast.error(i18n.t('ERROR.NETWORK_UNREACHABLE'), {
          autoClose: false,
          toastId: 'network-error',
        });
      }
      error._handledByInterceptor = true;
      return Promise.reject(error);
    }

    // 🟡 401 Unauthorized → refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 🟢 If session already expired, reject immediately
      if (isSessionExpired) {
        return Promise.reject(error);
      }

      // 🟢 If already refreshing, queue this request
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
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        console.warn('Refresh failed, triggering session expired');

        // 🟢 Process queue with error
        processQueue(refreshError, null);

        // 🟢 Trigger session expired (Provider will handle logout)
        triggerSessionExpired();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 🟢 If 401 after retry, trigger session expired
    if (error.response?.status === 401 && originalRequest._retry) {
      triggerSessionExpired();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

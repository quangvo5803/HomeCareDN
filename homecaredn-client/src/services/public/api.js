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

// Toast & lock flags
let networkErrorToastId = null;
let isShowingNetworkError = false;
let isSessionToastShown = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
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

    if (!originalRequest) return Promise.reject(error);

    // 403 Forbidden
    if (error.response?.status === 403 && !originalRequest._forbiddenHandled) {
      originalRequest._forbiddenHandled = true;
      toast.error(i18n.t('ERROR.FORBIDDEN'));
      navigateTo('/Unauthorized');
      return Promise.reject(error);
    }

    // 404 Not Found
    if (error.response?.status === 404 && !originalRequest._notFoundHandled) {
      originalRequest._notFoundHandled = true;
      toast.error(i18n.t('ERROR.NOT_FOUND'));
      navigateTo('/NotFound');
      return Promise.reject(error);
    }

    // Network error
    if (error.message === 'Network Error' && !error.response) {
      if (!isShowingNetworkError) {
        isShowingNetworkError = true;
        networkErrorToastId = toast.error(i18n.t('ERROR.NETWORK_UNREACHABLE'));
      }
      return Promise.reject(error);
    }

    // 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Token expired → logout ngay
      if (error.response?.data?.errorCode === 'LOGIN_TOKEN_EXPIRED') {
        if (!isSessionToastShown) {
          toast.error(i18n.t('ERROR.SESSION_EXPIRED'));
          isSessionToastShown = true;
        }
        authService.logout();
        navigateTo('/Login');
        return Promise.reject(error);
      }

      // Refresh token logic
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
        const newToken = res?.data?.accessToken;

        if (!newToken) throw new Error('Refresh token failed');

        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        if (!isSessionToastShown) {
          toast.error(i18n.t('ERROR.SESSION_EXPIRED'));
          isSessionToastShown = true;
        }

        authService.logout();
        navigateTo('/Login');
        return Promise.reject(err); // KHÔNG retry nữa
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

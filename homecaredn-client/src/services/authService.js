// src/services/authService.js
import api from '../api';

export const authService = {
  register: async (email, fullName) => {
    return api.post('/Authorize/register', { email, fullName });
  },

  login: async (email) => {
    return api.post('/Authorize/login', { email });
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/Authorize/verify-otp', { email, otp });
    // Lưu accessToken vào localStorage
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },

  refreshToken: async () => {
    // refresh token backend lấy từ cookie, không cần gửi body
    const response = await api.post('/Authorize/refresh-token');
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
  },
};

// authService.js
import api from '../api';

export const authService = {
  register: (email, fullName) =>
    api.post('/Authorize/register', { email, fullName }),
  login: (email) => api.post('/Authorize/login', { email }),
  verifyOtp: async (email, otp) => {
    const res = await api.post('/Authorize/verify-otp', { email, otp });
    return res;
  },
  resentOtp: (email) => api.post('/Authorize/login', { email }),
  refreshToken: () => api.post('/Authorize/refresh-token'), // backend đọc cookie HttpOnly
  logout: () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/Login';
  },
};

export default authService;

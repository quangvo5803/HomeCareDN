// authService.js
import api from './public/api';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL + '/api';

export const authService = {
  register: (email, fullName) =>
    api.post('/Authorize/register', { email, fullName }),
  login: (email, password) => {
    const payload = { email };
    if (password) {
      payload.password = password;
    }
    return api.post('/Authorize/login', payload);
  },
  verifyOtp: async (email, otp) => {
    const res = await api.post('/Authorize/verify-otp', { email, otp });
    return res;
  },
  resendOtp: (email) => api.post('/Authorize/login', { email }),
  refreshToken: () =>
    axios.post(
      `${BASE_URL}/Authorize/refresh-token`,
      {},
      { withCredentials: true }
    ),

  logout: () =>
    axios.post(`${BASE_URL}/Authorize/logout`, {}, { withCredentials: true }),
  googleLogin: (credential) =>
    api.post(`/Authorize/google-login`, { credential }),
};

export default authService;

import api from '../api';

export const authService = {
  register: (Email, FullName) => {
    return api.post(`/Authorize/register`, { Email, FullName });
  },

  login: (Email) => {
    return api.post(`/Authorize/login`, { Email });
  },

  verifyOtp: (Email, OTP) => {
    return api.post(`/Authorize/verify-otp`, { Email, OTP });
  },

  refreshToken: (UserId, RefreshToken) => {
    return api.post(`/Authorize/refresh-token`, { UserId, RefreshToken });
  },
};

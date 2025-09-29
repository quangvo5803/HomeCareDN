import api from '../api';

export const profileService = {
  getProfile: (userId) => api.get(`/Customer/get-profile/${userId}`),
  updateProfile: (payload) => api.put(`/Customer/update-profile`, payload),
};

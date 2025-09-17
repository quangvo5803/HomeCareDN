import api from '../api';

export const profileService = {
  getProfile: (userId) => api.get(`/Profile/get-profile/${userId}`),
  updateProfile: (payload) => api.put(`/Profile/update-profile`, payload),
};

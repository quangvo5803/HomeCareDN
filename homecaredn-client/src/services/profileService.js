import api from '../api';

export const profileService = {
  getByUser: (userId) => api.get(`/Profile/get-profile/${userId}`),
  updateByUser: (payload) => api.put(`/Profile/update-profile`, payload),
};
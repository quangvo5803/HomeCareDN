import api from '../api';

export const profileService = {
  getProfile: (userId) => api.get(`/CustomerProfile/get-profile/${userId}`),
  updateProfile: (payload) =>
    api.put(`/CustomerProfile/update-profile`, payload),
};

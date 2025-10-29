import api from './public/api';

export const profileService = {
  getById: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  update: async (dto) => {
    //  dto = { userId, fullName, phoneNumber?, gender? }
    const response = await api.put('/profile', dto);
    return response.data;
  },
};

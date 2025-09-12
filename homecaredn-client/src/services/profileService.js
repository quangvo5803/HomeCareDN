import api from '../api';

export const profileService = {
  getMine: () => api.get('/Profile'),
  update: (payload) => api.put('/Profile', payload),
};
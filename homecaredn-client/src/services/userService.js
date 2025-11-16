import api from './public/api';

export const userService = {
  getAll: async (params) => {
    const response = await api.get('/Users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  },

  updateUser: async (dto) => {
    const response = await api.put(`/Users`, dto);
    return response.data;
  },

  createAddress: async (dto) => {
    const response = await api.post('/Users/addresses', dto);
    return response.data;
  },

  updateAddress: async (dto) => {
    const response = await api.put('/Users/addresses', dto);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/Users/addresses/${id}`);
    return response.data;
  },
};

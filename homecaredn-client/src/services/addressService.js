import api from '../api';

export const addressService = {
  getAll: () => api.get('/Addresses'),
  getById: (id) => api.get(`/Addresses/${id}`),
  create: (payload) => api.post('/Addresses', payload),
  update: (id, payload) => api.put(`/Addresses/${id}`, payload),
  remove: (id) => api.delete(`/Addresses/${id}`),
};
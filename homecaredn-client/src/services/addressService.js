import api from '../api';

export const addressService = {
  getUserAddress: (userId) => api.get(`/Addresses/get-user-address/${userId}`),

  createAddress: (payload) => api.post(`/Addresses/create-address`, payload),

  updateAddress: (payload) => api.put(`/Addresses/update-address`, payload),

  removeAddress: (id) => api.delete(`/Addresses/delete-address/${id}`),
};

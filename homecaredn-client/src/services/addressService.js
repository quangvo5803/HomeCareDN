import api from '../api';

export const addressService = {
  getUserAddress: async (userId) => {
    const response = await api.get(`/Customer/get-user-address/${userId}`);
    return response.data;
  },

  createAddress: async (payload) => {
    const response = await api.post(`/Customer/create-address`, payload);
    return response.data;
  },

  updateAddress: async (payload) => {
    const response = await api.put(`/Customer/update-address`, payload);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/Customer/delete-address/${id}`);
    return response.data;
  },
};

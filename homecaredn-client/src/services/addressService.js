import api from '../api';

export const addressService = {
  getAddressByUser: (userId) =>
    api.get(`/Addresses/address-by-user/${userId}`),

  createAddressByUser: (payload) =>
    api.post(`/Addresses/create-address-by-user`, {payload }),

  updateAddress: (payload) =>
    api.put(`/Addresses/update-address`, { payload }),

  removeAddress: (id) =>
    api.delete(`/Addresses/delete-address/${id}`),
};
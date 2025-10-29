import api from '../api';
export const address = {
  getUserAddress: async (userId) => {
    const response = await api.get(
      `/CustomerAddresses/get-user-address/${userId}`
    );
    return response.data;
  },

  createAddress: async (payload) => {
    const response = await api.post(
      `/CustomerAddresses/create-address`,
      payload
    );
    return response.data;
  },

  updateAddress: async (payload) => {
    const response = await api.put(
      `/CustomerAddresses/update-address`,
      payload
    );
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(
      `/CustomerAddresses/delete-address/${id}`
    );
    return response.data;
  },
};

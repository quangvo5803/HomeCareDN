import api from './public/api';

export const paymentService = {
  createPayCommission: async (request) => {
    const response = await api.post(`/Payment/create-payment`, request);
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/Payment/get-all', { params });
    return response.data;
  },
};

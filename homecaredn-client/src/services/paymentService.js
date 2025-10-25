import api from './api';

export const PaymentService = {
  createPayCommission: async (request) => {
    const response = await api.post(`/Payment/create-payment`, request);
    return response.data;
  },
};

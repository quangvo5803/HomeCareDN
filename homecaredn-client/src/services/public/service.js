import api from '../api';
export const service = {
  getAllService: async (params = {}) => {
    const response = await api.get('/Public/get-all-services', { params });
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/Public/get-service/${id}`);
    return response.data;
  },
};

import api from '../api';
export const brand = {
  getAllBrands: async (params = {}) => {
    const response = await api.get('/Public/get-all-brands', { params });
    return response.data;
  },

  getBrandById: async (id) => {
    const response = await api.get(`/Public/get-brand/${id}`);
    return response.data;
  },
};

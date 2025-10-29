import api from '../api';
export const material = {
  getAllMaterial: async (params = {}) => {
    const response = await api.get('/Public/get-all-material', { params });
    return response.data;
  },

  getMaterialById: async (id) => {
    const response = await api.get(`/Public/get-material/${id}`);
    return response.data;
  },
  getMaterialByCategory: async (id) => {
    const response = await api.get(`/Public/get-material-by-category/${id}`);
    return response.data;
  },

  getMaterialByBrand: async (id) => {
    const response = await api.get(`/Public/get-material-by-brand/${id}`);
    return response.data;
  },
};

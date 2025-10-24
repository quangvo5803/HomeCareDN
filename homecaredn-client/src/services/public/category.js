import api from '../api';
export const category = {
  getAllCategories: async (params = {}) => {
    const response = await api.get('/Public/get-all-categories', {
      params,
    });
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/Public/get-category/${id}`);
    return response.data;
  },
};

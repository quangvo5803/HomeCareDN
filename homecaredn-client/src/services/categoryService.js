import api from './public/api';

export const categoryService = {
  // ====================== ANONYMOUS ======================
  getAll: async (params) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  // ====================== ADMIN, DISTRIBUTOR ======================
  checkCategory: async ({ name, categoryID = null }) => {
    const params = { name };
    if (categoryID) params.categoryID = categoryID;

    const response = await api.get(`/categories/check-category`, {
      params,
    });
    return response.data;
  },
  create: async (dto) => {
    // dto = { CategoryName, CategoryNameEN?, IsActive, UserID, CategoryLogoUrl, CategoryLogoPublicId }
    const response = await api.post('/categories', dto);
    return response.data;
  },

  update: async (dto) => {
    // dto = { CategoryID, CategoryName?, CategoryNameEN?, IsActive, CategoryLogoUrl?, CategoryLogoPublicId? }
    const response = await api.put('/categories', dto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

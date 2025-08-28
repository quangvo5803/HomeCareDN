import api from '../api';

export const categoryService = {
  // Public APIs
  getAllCategories: async () => {
    const response = await api.get('/Categories/get-all-categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/Categories/get-category/${id}`);
    return response.data;
  },

  // Admin-only APIs
  createCategory: async ({ CategoryName }) => {
    const response = await api.post('/Admin/create-category', {
      categoryName: CategoryName,
    });
    return response.data;
  },

  updateCategory: async ({ CategoryID, CategoryName }) => {
    const response = await api.put('/Admin/update-category', {
      categoryID: CategoryID,
      categoryName: CategoryName,
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/Admin/delete-category/${id}`);
    return response.data;
  },
};

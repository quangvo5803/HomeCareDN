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
  createCategory: async ({ CategoryName, ParentCategoryID }) => {
    const response = await api.post('/Admin/create-category', {
      categoryName: CategoryName,
      parentCategoryID: ParentCategoryID || null,
    });
    return response.data;
  },

  updateCategory: async ({ CategoryID, CategoryName, ParentCategoryID }) => {
    const response = await api.put('/Admin/update-category', {
      categoryID: CategoryID,
      categoryName: CategoryName,
      parentCategoryID: ParentCategoryID || null,
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/Admin/delete-category/${id}`);
    return response.data;
  },
};

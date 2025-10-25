import api from '../api';
export const category = {
  createCategory: async (dto) => {
    const formData = new FormData();
    formData.append('CategoryName', dto.CategoryName);
    formData.append('UserID', dto.UserID);
    if (dto.CategoryNameEN)
      formData.append('CategoryNameEN', dto.CategoryNameEN);

    if (dto.CategoryLogoUrl)
      formData.append('CategoryLogoUrl', dto.CategoryLogoUrl);
    if (dto.CategoryLogoPublicId)
      formData.append('CategoryLogoPublicId', dto.CategoryLogoPublicId);
    if (dto.IsActive !== undefined) formData.append('IsActive', dto.IsActive);
    const response = await api.post(
      '/DistributorCategory/create-category',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  updateCategory: async (dto) => {
    const formData = new FormData();
    formData.append('CategoryID', dto.CategoryID);
    formData.append('CategoryName', dto.CategoryName);
    if (dto.CategoryNameEN)
      formData.append('CategoryNameEN', dto.CategoryNameEN);

    if (dto.CategoryLogoUrl)
      formData.append('CategoryLogoUrl', dto.CategoryLogoUrl);
    if (dto.CategoryLogoPublicId)
      formData.append('CategoryLogoPublicId', dto.CategoryLogoPublicId);
    if (dto.IsActive !== undefined) formData.append('IsActive', dto.IsActive);
    const response = await api.put(
      '/DistributorCategory/update-category',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(
      `/DistributorCategory/delete-category/${id}`
    );
    return response.data;
  },
};

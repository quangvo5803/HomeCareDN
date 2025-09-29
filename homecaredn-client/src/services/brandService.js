import api from '../api';

export const brandService = {
  // Public APIs
  getAllBrands: async (params = {}) => {
    // Hỗ trợ query params cho pagination/search
    const response = await api.get('/Brands/get-all-brands', { params });
    return response.data;
  },

  getBrandById: async (id) => {
    const response = await api.get(`/Brands/get-brand/${id}`);
    return response.data;
  },

  // Admin-only APIs
  createBrand: async (dto) => {
    const formData = new FormData();
    formData.append('BrandName', dto.BrandName);
    if (dto.BrandDescription)
      formData.append('BrandDescription', dto.BrandDescription);
    if (dto.BrandNameEN) formData.append('BrandNameEN', dto.BrandNameEN);
    if (dto.BrandDescriptionEN)
      formData.append('BrandDescriptionEN', dto.BrandDescriptionEN);
    if (dto.BrandLogoUrl) formData.append('BrandLogoUrl', dto.BrandLogoUrl);
    if (dto.BrandLogoPublicId)
      formData.append('BrandLogoPublicId', dto.BrandLogoPublicId);

    const response = await api.post('/AdminBrand/create-brand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBrand: async (dto) => {
    const formData = new FormData();
    formData.append('BrandID', dto.BrandID);
    formData.append('BrandName', dto.BrandName);
    if (dto.BrandDescription)
      formData.append('BrandDescription', dto.BrandDescription);
    if (dto.BrandNameEN) formData.append('BrandNameEN', dto.BrandNameEN);
    if (dto.BrandDescriptionEN)
      formData.append('BrandDescriptionEN', dto.BrandDescriptionEN);
    if (dto.BrandLogoUrl) formData.append('BrandLogoUrl', dto.BrandLogoUrl);
    if (dto.BrandLogoPublicId)
      formData.append('BrandLogoPublicId', dto.BrandLogoPublicId);
    const response = await api.put('/AdminBrand/update-brand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`/AdminBrand/delete-brand/${id}`);
    return response.data;
  },
};

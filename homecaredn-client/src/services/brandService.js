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
    if (dto.LogoFile) formData.append('LogoFile', dto.LogoFile);

    const response = await api.post('/Admin/create-brand', formData, {
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
    if (dto.LogoFile) formData.append('LogoFile', dto.LogoFile);

    const response = await api.put('/Admin/update-brand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`/Admin/delete-brand/${id}`);
    return response.data;
  },
};

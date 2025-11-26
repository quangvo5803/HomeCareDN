import api from './public/api';

export const brandService = {
  // ====================== ANONYMOUS ======================
  getAll: async (params) => {
    const response = await api.get('/brands', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  // ====================== ADMIN ======================
  checkBrand: async (name) => {
    const response = await api.get(`/brands/check-brand`, {
      params: { name },
    });
    return response.data;
  },
  create: async (dto) => {
    // dto = { BrandName, BrandDescription?, BrandNameEN?, BrandDescriptionEN?, BrandLogoUrl, BrandLogoPublicId }
    const response = await api.post('/brands', dto);
    return response.data;
  },

  update: async (dto) => {
    // dto = { BrandID, BrandName, BrandDescription?, BrandNameEN?, BrandDescriptionEN?, BrandLogoUrl?, BrandLogoPublicId? }
    const response = await api.put('/brands', dto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

import api from './public/api';

export const materialService = {
  // ====================== ANONYMOUS ======================
  getAll: async (params) => {
    const response = await api.get('/materials', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  getByCategory: async (categoryID) => {
    const response = await api.get(`/categories/${categoryID}/materials`);
    return response.data;
  },

  getByBrand: async (brandID) => {
    const response = await api.get(`/brands/${brandID}/materials`);
    return response.data;
  },

  // ====================== ADMIN/DISTRIBUTOR ======================
  getByUserId: async (params) => {
    const response = await api.get(`/users/materials`, { params });
    return response.data;
  },
  create: async (dto) => {
    // dto = { UserID, CategoryID, Name, NameEN?, BrandID?, Unit?, UnitEN?, Description?, DescriptionEN?, ImageUrls[], ImagePublicIds[] }
    const response = await api.post('/materials', dto);
    return response.data;
  },

  update: async (dto) => {
    // dto = { MaterialID, Name, NameEN?, BrandID?, CategoryID?, Unit?, UnitEN?, Description?, DescriptionEN?, ImageUrls[], ImagePublicIds[] }
    const response = await api.put('/materials', dto);
    return response.data; // trả về material vừa cập nhật
  },

  delete: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data; // xóa material theo id
  },
};

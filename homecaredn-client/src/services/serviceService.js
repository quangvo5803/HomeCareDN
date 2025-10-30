import api from './public/api';

export const serviceService = {
  // ====================== ANONYMOUS ======================
  getAll: async (params) => {
    const response = await api.get('/services/get-all-services', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/get-service/${id}`);
    return response.data;
  },
  // ====================== ADMIN ======================
  create: async (dto) => {
    // dto
    // {
    //   Name: string,
    //   NameEN?: string,
    //   ServiceType: number,
    //   PackageOption?: number,
    //   BuildingType: number,
    //   MainStructureType?: number,
    //   DesignStyle?: number,
    //   Description?: string,
    //   DescriptionEN?: string,
    //   ImageUrls: string[],
    //   ImagePublicIds: string[]
    // }
    const response = await api.post('/services', dto);
    return response.data;
  },

  update: async (dto) => {
    // dto khớp với ServiceUpdateRequestDto
    const response = await api.put('/services', dto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

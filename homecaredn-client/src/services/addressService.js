import api from './public/api';

export const addressService = {
  // ====================== CUSTOMER ======================
  getAll: async (userId) => {
    const response = await api.get(`/addresses`, { params: { userId } });
    return response.data;
  },

  create: async (dto) => {
    //  dto = { userId, city, district, ward, detail }
    const response = await api.post('/addresses', dto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  update: async (dto) => {
    //  dto = { userId, addressID, city, district, ward, detail }
    const response = await api.put(`/addresses/`, dto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};

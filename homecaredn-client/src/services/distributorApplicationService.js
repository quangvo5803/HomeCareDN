import api from './public/api';

export const distributorApplicationService = {
  // ====================== ADMIN ======================
  getAllForAdmin: async (params) => {
    const response = await api.get('/distributor-applications/admin', {
      params,
    });
    return response.data;
  },

  getAllByUserIdForAdmin: async (params) => {
    const response = await api.get(
      '/distributor-applications/admin/get-all-by-user-id',
      { params }
    );
    return response.data;
  },

  getByIdForAdmin: async (id) => {
    const response = await api.get(`/distributor-applications/admin/${id}`);
    return response.data;
  },
  // ====================== CUSTOMER ======================
  getAllByMaterialRequestIdForCustomer: async (params) => {
    const response = await api.get('/distributor-applications/customer/all', {
      params,
    });
    return response.data;
  },
  getByIdForCustomer: async (id) => {
    const response = await api.get(`/distributor-applications/customer/${id}`);
    return response.data;
  },

  // ====================== DISTRIBUTOR ======================
  getByMaterialRequestIdForContractor: async (dto) => {
    const response = await api.get(
      `/distributor-applications/distributor/applied`,
      {
        params: dto,
      }
    );
    return response.data;
  },

  create: async (dto) => {
    const response = await api.post(
      '/distributor-applications/distributor/create',
      dto,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(
      `/distributor-applications/distributor/delete/${id}`
    );
    return response.data;
  },
};

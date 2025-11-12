import api from './public/api';

export const contractorApplicationService = {
  // ====================== ADMIN ======================
  getAllForAdmin: async (params) => {
    const response = await api.get('/contractor-applications/admin', {
      params,
    });
    return response.data;
  },

  getAllByUserIdForAdmin: async (params) => {
    const response = await api.get(
      '/contractor-applications/admin/get-all-by-user-id',
      { params }
    );
    return response.data;
  },

  getByIdForAdmin: async (id) => {
    const response = await api.get(`/contractor-applications/admin/${id}`);
    return response.data;
  },

  // ====================== CUSTOMER ======================
  getAllForCustomer: async (params) => {
    const response = await api.get('/contractor-applications/customer', {
      params,
    });
    return response.data;
  },

  getByIdForCustomer: async (id) => {
    const response = await api.get(`/contractor-applications/customer/${id}`);
    return response.data;
  },

  accept: async (id) => {
    const response = await api.put(
      `/contractor-applications/customer/${id}/accept`
    );
    return response.data;
  },

  reject: async (id) => {
    const response = await api.put(
      `/contractor-applications/customer/${id}/reject`
    );
    return response.data;
  },

  // ====================== Contractor ======================
  getAllForContractor: async (params) => {
    const response = await api.get('/contractor-applications/contractor', {
      params,
    });
    return response.data;
  },
  getLatestApplications: async (params) => {
    const { data } = await api.get(
      '/contractor-applications/contractor/applications',
      {
        params: params,
      }
    );
    return data;
  },
  getByServiceRequestIdForContractor: async (dto) => {
    const response = await api.get(
      `/contractor-applications/contractor/get-applied/`,
      {
        params: dto,
      }
    );
    return response.data;
  },
  getByIdForContractor: async (id) => {
    const response = await api.get(`/contractor-applications/contractor/${id}`);
    return response.data;
  },

  create: async (dto) => {
    // dto = ContractorCreateApplicationDto

    const response = await api.post(
      '/contractor-applications/contractor',
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
      `/contractor-applications/contractor/${id}`
    );
    return response.data;
  },
};

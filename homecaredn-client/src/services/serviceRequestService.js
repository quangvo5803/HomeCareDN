import api from './public/api';

export const serviceRequestService = {
  // ====================== ADMIN ======================
  getAllForAdmin: async (params) => {
    const response = await api.get('/service-requests/admin/all', { params });
    return response.data;
  },

  getByIdForAdmin: async (dto) => {
    // dto = { ServiceRequestID: string }
    const response = await api.get('/service-requests/admin/detail', {
      params: dto,
    });
    return response.data;
  },

  // ====================== CUSTOMER ======================
  getAllForCustomer: async (params) => {
    const response = await api.get('/service-requests/customer/all', {
      params,
    });
    return response.data;
  },

  getByIdForCustomer: async (dto) => {
    // dto = { ServiceRequestID: string }
    const response = await api.get('/service-requests/customer/detail', {
      params: dto,
    });
    return response.data;
  },

  createForCustomer: async (dto) => {
    const response = await api.post('/service-requests', dto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  updateForCustomer: async (dto) => {
    const response = await api.put('/service-requests', dto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  deleteForCustomer: async (id) => {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
  },

  // ====================== DISTRIBUTOR ======================
  getAllForContractor: async (params) => {
    const response = await api.get('/service-requests/contractor/all', {
      params,
    });
    return response.data;
  },

  getByIdForContractor: async (dto) => {
    // dto = { ServiceRequestID: string, ContractorID?: string }
    const response = await api.get('/service-requests/contractor/detail', {
      params: dto,
    });
    return response.data;
  },
};

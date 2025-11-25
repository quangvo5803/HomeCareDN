import api from './public/api';

export const partnerRequestService = {
  // ====================== ANONYMOUS ======================
  sendOtp: async (dto) => {
    const response = await api.post('/partner-requests/send-otp', dto);
    return response.data;
  },
  verifyOtp: async (dto) => {
    const response = await api.post('/partner-requests/verify-otp', dto);
    return response.data;
  },
  create: async (dto) => {
    const response = await api.post(
      '/partner-requests/create-partner-request',
      dto
    );
    return response.data;
  },

  // ====================== ADMIN ======================
  getAll: async (params) => {
    const response = await api.get('/partner-requests', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/partner-requests/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.put(`/partner-requests/${id}/approve`);
    return response.data;
  },

  reject: async (dto) => {
    const response = await api.put('/partner-requests/reject', dto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/partner-requests/${id}`);
    return response.data;
  },
};

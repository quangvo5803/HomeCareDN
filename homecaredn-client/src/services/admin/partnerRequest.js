import api from '../api';

export const partnerRequest = {
  getAllPartnerRequests: async (params = {}) => {
    const res = await api.get('/AdminPartnerRequest/get-all-partner-requests', {
      params,
    });
    return res.data;
  },

  getPartnerRequestById: async (id) => {
    const res = await api.get(`/AdminPartnerRequest/get-partner-request/${id}`);
    return res.data;
  },

  approvePartnerRequest: async (id) => {
    const res = await api.put(
      `/AdminPartnerRequest/approve-partner-request/${id}`
    );
    return res.data;
  },

  rejectPartnerRequest: async (rejectData) => {
    const res = await api.put(
      '/AdminPartnerRequest/reject-partner-request',
      rejectData
    );
    return res.data;
  },

  deletePartnerRequest: async (id) => {
    const res = await api.delete(
      `/AdminPartnerRequests/delete-partner-request/${id}`
    );
    return res.data;
  },
};

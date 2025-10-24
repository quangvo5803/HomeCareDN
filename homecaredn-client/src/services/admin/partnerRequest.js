import api from '../api';

export const partnerRequest = {
  getAllPartnerRequests: async (params = {}) => {
    const res = await api.get(
      '/AdminPartnerRequests/get-all-partner-requests',
      {
        params,
      }
    );
    return res.data;
  },

  getPartnerRequestById: async (id) => {
    const res = await api.get(
      `/AdminPartnerRequests/get-partner-request/${id}`
    );
    return res.data;
  },

  approvePartnerRequest: async (id) => {
    const res = await api.put(
      `/AdminPartnerRequests/approve-partner-request/${id}`
    );
    return res.data;
  },

  rejectPartnerRequest: async (rejectData) => {
    const res = await api.put(
      '/AdminPartnerRequests/reject-partner-request',
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

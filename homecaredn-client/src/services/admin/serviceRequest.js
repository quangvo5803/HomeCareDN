import api from '../api';
export const serviceRequest = {
  getAllServiceRequest: async (params = {}) => {
    const res = await api.get('/AdminServiceRequest/get-all-service-request', {
      params,
    });
    return res.data;
  },
  getServiceRequestById: async (id) => {
    const res = await api.get(
      `/AdminServiceRequest/get-service-request-by-id/${id}`
    );
    return res.data;
  },
};

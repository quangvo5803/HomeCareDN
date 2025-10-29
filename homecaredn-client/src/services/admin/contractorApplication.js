import api from '../api';
export const contractorApplication = {
  getAllContractorByServiceRequestId: async (params = {}) => {
    const res = await api.get(
      '/AdminContractorApplication/get-all-contractor-by-service-request-id',
      {
        params,
      }
    );
    return res.data;
  },
};

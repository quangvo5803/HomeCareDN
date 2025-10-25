import api from '../api';
export const contractorApplication = {
  getAllContractorByServiceRequestId: async (params = {}) => {
    const res = await api.get(
      '/CustomerContractorApplication/get-all-contractor-by-service-request-id',
      {
        params,
      }
    );
    return res.data;
  },
  acceptContractorApplication: async (contractorApplicationId) => {
    const res = await api.put(
      `/CustomerContractorApplication/accept-contractor-application/${contractorApplicationId}`
    );
    return res.data;
  },

  rejectContractorApplication: async (contractorApplicationId) => {
    const res = await api.put(
      `/CustomerContractorApplication/reject-contractor-application/${contractorApplicationId}`
    );
    return res.data;
  },
};

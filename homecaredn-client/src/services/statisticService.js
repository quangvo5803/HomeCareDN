import api from './public/api';

export const StatisticService = {
  getBarChart: async (year, role, contractorId = null) => {
    const params = { year, role };
    if (contractorId) params.contractorId = contractorId;

    const response = await api.get(`/Statistics/bar-chart`, { params });
    return response;
  },

  getLineChart: async (year, role, contractorId = null) => {
    const params = { year, role };
    if (contractorId) params.contractorId = contractorId;

    const response = await api.get(`/Statistics/line-chart`, { params });
    return response;
  },

  // ====================== Admin ======================
  getPieChart: async (year) => {
    const response = await api.get(`/Statistics/admin/pie-chart/${year}`);
    return response;
  },

  getTopStatistic: async () => {
    const response = await api.get('/Statistics/admin/top-statistics');
    return response;
  },

  getStatStatistic: async () => {
    const response = await api.get('/Statistics/admin/stat-statistics');
    return response;
  },

  // ====================== Contractor ======================
  getStatStatisticForContractor: async () => {
    const { data } = await api.get(
      '/Statistics/contractor/stat-statistics'
    );
    return data;
  },
};

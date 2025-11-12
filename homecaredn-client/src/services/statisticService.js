import api from './public/api';

export const StatisticService = {

  // ====================== Admin ======================
  getBarChart: async (year) => {
    const response = await api.get(`/Statistics/admin/bar-chart/${year}`);
    return response;
  },

  getPieChart: async (year) => {
    const response = await api.get(`/Statistics/admin/pie-chart/${year}`);
    return response;
  },

  getLineChart: async (year) => {
    const response = await api.get(`/Statistics/admin/line-chart/${year}`);
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
  getBarChartForContractor: async (year, contractorID) => {
    const response = await api.get(`/Statistics/contractor/bar-chart/${year}`, {
      params: { contractorID },
    });
    return response;
  },
  getLineChartForContractor: async (year, contractorID) => {
    const response = await api.get(
      `/Statistics/contractor/line-chart/${year}`,
      {
        params: { contractorID },
      }
    );
    return response;
  },
};

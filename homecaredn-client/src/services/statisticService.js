import api from './public/api';

export const StatisticService = {
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
  getBarChartForContractor: async (year, userID) => {
    const response = await api.get(`/Statistics/contractor/bar-chart/${year}`, {
      params: { userID },
    });
    return response;
  },
};

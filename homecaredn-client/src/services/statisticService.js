import api from './public/api';

export const StatisticService = {
  getBarChart: async (
    year,
    role,
    contractorId = null,
    distributorId = null
  ) => {
    const params = { year, role };
    if (contractorId) params.contractorId = contractorId;
    if (distributorId) params.distributorId = distributorId;
    const response = await api.get(`/Statistics/bar-chart`, { params });
    return response;
  },

  getLineChart: async (
    year,
    role,
    contractorId = null,
    distributorId = null
  ) => {
    const params = { year, role };
    if (contractorId) params.contractorId = contractorId;
    if (distributorId) params.distributorId = distributorId;

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
    const { data } = await api.get('/Statistics/contractor/stat-statistics');
    return data;
  },
  // ====================== Distributor ======================
  getStatStatisticForDistributor: async () => {
    const { data } = await api.get('/Statistics/distributor/stat-statistics');
    return data;
  },
};

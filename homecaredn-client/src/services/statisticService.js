import api from './public/api';

export const StatisticService = {
    getLineChart: async (year) => {
        const response = await api.get(`/Statistics/admin/line-chart/${year}`);
        return response;
    },

    getPieChart: async (year) => {
        const response = await api.get(`/Statistics/admin/pie-chart/${year}`);
        return response;
    },

    getTopStatistic: async () => {
        const response = await api.get('/Statistics/admin/top-statistics');
        return response;
    }
}
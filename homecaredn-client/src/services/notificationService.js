import api from './public/api';

export const notificationService = {

    getAllForCustomer: async (params) => {
        const response = await api.get('/Notifications/Customer', { params });
        return response.data;
    },

    getAllForContractor: async (params) => {
        const response = await api.get('/Notifications/Contractor', { params });
        return response.data;
    },

    getAllForDistributor: async (params) => {
        const response = await api.get('/Notifications/Distributor', { params });
        return response.data;
    },
}
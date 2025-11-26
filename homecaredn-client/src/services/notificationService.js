import api from './public/api';

export const notificationService = {

    // ====================== CUSTOMER ======================
    getAllForCustomer: async (params) => {
        const response = await api.get('/Notifications/Customer', { params });
        return response.data;
    },

    // ====================== CONTRACTOR ======================
    getAllForContractor: async (params) => {
        const response = await api.get('/Notifications/Contractor', { params });
        return response.data;
    },

    // ====================== DISTRIBUTOR ======================
    getAllForDistributor: async (params) => {
        const response = await api.get('/Notifications/Distributor', { params });
        return response.data;
    },

    // ====================== ADMIN ======================
    getAllForAdmin: async (params) => {
        const response = await api.get('/Notifications/Admin', { params });
        return response.data;
    },

    createForAdmin: async (dto) => {
        const response = await api.post('/Notifications/Admin/create', dto);
        return response.data;
    },

    getByIdForAdmin: async (id) => {
        const response = await api.get(`/Notifications/Admin/${id}`);
        return response.data;
    },

    // ====================== ALL ======================
    readNotification: async (id) => {
        const response = await api.put(`/Notifications/${id}/read`);
        return response.data;
    },

    readAllNotifications: async (id) => {
        const response = await api.put(`/Notifications/${id}/read-all`);
        return response.data;
    }
}
import api from '../services/public/api';

export const searchService = {
    getAll: async (params) => {
        const response = await api.get('/Search', { params });
        return response.data;
    },

    searchMaterial: async (params) => {
        const response = await api.get('/Search/search-material', { params });
        return response.data;
    },

    searchService: async (params) => {
        const response = await api.get('/Search/search-service', { params });
        return response.data;
    },
};
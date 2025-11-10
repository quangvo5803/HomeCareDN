import api from "./public/api";

export const userService = {
    getAll: async (params) => {
        const response = await api.get('/Users/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/Users/${id}`);
        return response.data
    }
}
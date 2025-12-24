import api from "./public/api";

export const eKycService = {
    verify: async (dto) => {
        const response = await api.post('/EKycs', dto)
        return response.data;
    }
}
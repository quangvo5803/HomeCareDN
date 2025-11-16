import api from './public/api';

export const distributorApplicationService = {
    // ====================== CUSTOMER ======================
    getAllByMaterialRequestIdForCustomer: async (params) => {
        const response = await api
            .get('/DistributorApplications/customer/all', { params });
        return response.data;
    },
    getByIdForCustomer: async (id) => {
        const response = await api.get(`/DistributorApplications/customer/${id}`);
        return response.data;
    },

    // ====================== DISTRIBUTOR ======================
    getByMaterialRequestIdForContractor: async (dto) => {
        const response = await api
            .get(`/DistributorApplications/distributor/applied`, {
                params: dto,
            }
            );
        return response.data;
    },

    create: async (dto) => {
        const response = await api.post(
            '/DistributorApplications/distributor/create', dto,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(
            `/DistributorApplications/distributor/delete/${id}`
        );
        return response.data;
    },
}
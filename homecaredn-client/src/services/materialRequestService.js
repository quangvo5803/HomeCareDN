import api from './public/api';

export const materialRequestService = {
  // ====================== ADMIN ======================
  getAllForAdmin: async (params) => {
    const response = await api.get('/material-requests', { params });
    return response.data;
  },

  getByIdForAdmin: async (id) => {
    const response = await api.get(`/material-requests/admin/${id}`);
    return response.data;
  },

  // ====================== CUSTOMER ======================
  getAllForCustomer: async (params) => {
    const response = await api.get('/material-requests/my-requests', {
      params,
    });
    return response.data;
  },

  getByIdForCustomer: async (id) => {
    const response = await api.get(`/material-requests/customer/${id}`);
    return response.data;
  },

  createForCustomer: async (dto) => {
    // dto: { CustomerID: string, FirstMaterialID?: string }
    const response = await api.post('/material-requests', dto);
    return response.data;
  },

  updateForCustomer: async (dto) => {
    // dto: {
    //   MaterialRequestID: string,
    //   Description?: string,
    //   CanEditQuantity: boolean,
    //   AddItems?: [{ MaterialID: string, Quantity: number }],
    //   UpdateItems?: [{ MaterialRequestItemID: string, Quantity: number }],
    //   DeleteItemIDs?: [string]
    // }
    const response = await api.put('/material-requests', dto);
    return response.data;
  },

  deleteForCustomer: async (id) => {
    const response = await api.delete(`/material-requests/${id}`);
    return response.data;
  },

  // ====================== DISTRIBUTOR ======================
  getAllForDistributor: async (params) => {
    const response = await api.get('/material-requests/distributor', {
      params,
    });
    return response.data;
  },

  getByIdForDistributor: async (id) => {
    const response = await api.get(`/material-requests/distributor/${id}`);
    return response.data;
  },
};

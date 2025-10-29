import api from './public/api';

export const partnerRequestService = {
  // ====================== ANONYMOUS ======================
  create: async (dto) => {
    // dto = {
    //   PartnerRequestType: "Distributor" | "Contractor" | ...,
    //   CompanyName: string,
    //   Email: string,
    //   PhoneNumber: string,
    //   Description?: string,
    //   ImageUrls: string[],
    //   ImagePublicIds: string[]
    // }
    const response = await api.post(
      '/partner-requests/create-partner-request',
      dto
    );
    return response.data;
  },

  // ====================== ADMIN ======================
  getAll: async (params) => {
    // params = { PageNumber, PageSize, SortBy, Search, FilterID, ... }
    const response = await api.get('/partner-requests', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/partner-requests/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.put(`/partner-requests/${id}/approve`);
    return response.data;
  },

  reject: async (dto) => {
    // dto = {
    //   PartnerRequestID: string (guid),
    //   RejectionReason: string
    // }
    const response = await api.put('/partner-requests/reject', dto);
    return response.data;
  },

  // Delete partner request
  delete: async (id) => {
    const response = await api.delete(`/partner-requests/${id}`);
    return response.data;
  },
};

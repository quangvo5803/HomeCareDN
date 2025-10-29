<<<<<<< HEAD
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
=======
import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};
export const partnerRequestService = {
  createPartnerRequest: async (partnerRequestData) => {
    const formData = new FormData();
    appendIf(
      formData,
      'PartnerRequestType',
      partnerRequestData.PartnerRequestType
    );
    appendIf(formData, 'CompanyName', partnerRequestData.CompanyName);
    appendIf(formData, 'Email', partnerRequestData.Email);
    appendIf(formData, 'PhoneNumber', partnerRequestData.PhoneNumber);
    appendIf(formData, 'Description', partnerRequestData.Description);

    for (const imageUrl of partnerRequestData.ImageUrls || []) {
      formData.append('ImageUrls', imageUrl);
    }

    for (const publicId of partnerRequestData.ImagePublicIds || []) {
      formData.append('ImagePublicIds', publicId);
    }

    for (const documentUrl of partnerRequestData.DocumentUrls || []) {
      formData.append('DocumentUrls', documentUrl);
    }

    for (const publicId of partnerRequestData.DocumentPublicIds || []) {
      formData.append('DocumentPublicIds', publicId);
    }

    const res = await api.post(
      '/PartnerRequests/create-partner-request',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  getAllPartnerRequests: async (params = {}) => {
    const res = await api.get(
      '/AdminPartnerRequests/get-all-partner-requests',
      {
        params,
      }
    );
    return res.data;
  },

  getPartnerRequestById: async (id) => {
    const res = await api.get(
      `/AdminPartnerRequests/get-partner-request/${id}`
    );
    return res.data;
  },

  approvePartnerRequest: async (id) => {
    const res = await api.put(
      `/AdminPartnerRequests/approve-partner-request/${id}`
    );
    return res.data;
  },

  rejectPartnerRequest: async (rejectData) => {
    const res = await api.put(
      '/AdminPartnerRequests/reject-partner-request',
      rejectData
    );
    return res.data;
  },

  deletePartnerRequest: async (id) => {
    const res = await api.delete(
      `/AdminPartnerRequests/delete-partner-request/${id}`
    );
    return res.data;
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
  },
};

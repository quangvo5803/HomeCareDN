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
  },
};

import api from '../api';

export const partnerRequestService = {
  createPartnerRequest: async (partnerData) => {
    const fd = new FormData();
    fd.append('PartnerType', String(partnerData.partnerType).trim());
    fd.append(
      'FullName',
      String(partnerData.fullName || partnerData.FullName || '').trim()
    );
    fd.append('CompanyName', String(partnerData.companyName).trim());
    fd.append('Email', String(partnerData.email).trim().toLowerCase());
    fd.append('PhoneNumber', String(partnerData.phoneNumber).trim());
    fd.append(
      'Description',
      partnerData.description ? String(partnerData.description).trim() : ''
    );

    const imageUrls = partnerData.imageUrls ?? [];
    const imagePublicIds = partnerData.imagePublicIds ?? [];

    for (const url of imageUrls) {
      fd.append('ImageUrls', url);
    }

    for (const publicId of imagePublicIds) {
      fd.append('ImagePublicIds', publicId);
    }

    const res = await api.post('/PartnerRequests/create-partner', fd);
    return res.data;
  },

  getAllPartnerRequests: async (params = {}) => {
    const res = await api.get('/AdminPartnerRequests/get-all-partners', {
      params,
    });
    return res.data;
  },

  getPartnerRequestById: async (id) => {
    const res = await api.get(`/AdminPartnerRequests/get-partner/${id}`);
    return res.data;
  },

  approvePartnerRequest: async ({ partnerID, approvedUserId }) => {
    const res = await api.put('/AdminPartnerRequests/approve-partner', {
      partnerID,
      approvedUserId,
    });
    return res.data;
  },

  rejectPartnerRequest: async ({ partnerID, rejectionReason }) => {
    const res = await api.put('/AdminPartnerRequests/reject-partner', {
      partnerID,
      rejectionReason,
    });
    return res.data;
  },

  deletePartnerRequest: async (id) => {
    const res = await api.delete(`/AdminPartner/delete-partner/${id}`);
    return res.data;
  },
};

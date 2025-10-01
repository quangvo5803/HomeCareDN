import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

const buildPartnerFormData = (partner) => {
  const formData = new FormData();

  // ID (chỉ dùng khi update)
  appendIf(formData, 'PartnerID', partner.PartnerID);

  // Required fields
  appendIf(formData, 'FullName', partner.FullName);
  appendIf(formData, 'PartnerType', partner.PartnerType);
  appendIf(formData, 'CompanyName', partner.CompanyName);
  appendIf(formData, 'Email', partner.Email);
  appendIf(formData, 'PhoneNumber', partner.PhoneNumber);
  appendIf(formData, 'Description', partner.Description);
  appendIf(formData, 'Status', partner.Status);
  appendIf(formData, 'RejectionReason', partner.RejectionReason);
  appendIf(formData, 'ApprovedUserId', partner.ApprovedUserId);
  appendIf(formData, 'CreatedAt', partner.CreatedAt);
  // Images
  (partner.ImageUrls || []).forEach((ImageUrls) =>
    formData.append('ImageUrls', ImageUrls)
  );
  (partner.ImagePublicIds || []).forEach((ImagePublicIds) =>
    formData.append('ImagePublicIds', ImagePublicIds)
  );

  return formData;
};

export const partnerService = {
  createPartner: async (partnerData) => {
    const formData = buildPartnerFormData(partnerData);
    const response = await api.post('/Partners/create-partner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllPartners: async (params = {}) => {
      const response = await api.get('/AdminPartner/get-all-partners', { params });
      return response.data;
  },

  getPartnerById: async (id) => {
      const response = await api.get(`/AdminPartner/get-partner/${id}`);
      return response.data;
  },

  approvePartner: async (data) => {
      const formData = buildPartnerFormData(data);
      const response = await api.put('/AdminPartner/approve-partner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
  },

  rejectPartner: async (data) => {
      const formData = buildPartnerFormData(data);
      const response = await api.put('/AdminPartner/reject-partner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
  },

  deletePartner: async (id) => {
      const response = await api.delete(`/AdminPartner/delete-partner/${id}`);
      return response.data;
  },
};

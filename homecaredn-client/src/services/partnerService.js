import api from '../api';

const partnerService = {
  createPartner: async (partnerData) => {
    try {
      const fd = new FormData();
      fd.append('PartnerType', String(partnerData.partnerType).trim());
      fd.append('FullName', String(partnerData.fullName || partnerData.FullName || '').trim());
      fd.append('CompanyName', String(partnerData.companyName).trim());
      fd.append('Email', String(partnerData.email).trim().toLowerCase());
      fd.append('PhoneNumber', String(partnerData.phoneNumber).trim());
      fd.append('Description', partnerData.description ? String(partnerData.description).trim() : '');

      const imageUrls = partnerData.imageUrls ?? [];
      const imagePublicIds = partnerData.imagePublicIds ?? [];

      for (const url of imageUrls) {
        fd.append('ImageUrls', url);
      }

      for (const publicId of imagePublicIds) {
        fd.append('ImagePublicIds', publicId);
      }

      const res = await api.post('/Partners/create-partner', fd);
      return res.data;
    } catch (error) {
      console.error('Create partner error:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getAllPartners: async (params = {}) => {
    try {
      const res = await api.get('/AdminPartner/get-all-partners', { params });
      return res.data;
    } catch (error) {
      console.error('Get partners error:', error);
      throw error;
    }
  },

  getPartnerById: async (id) => {
    try {
      const res = await api.get(`/AdminPartner/get-partner/${id}`);
      return res.data;
    } catch (error) {
      console.error('Get partner by ID error:', error);
      throw error;
    }
  },

  approvePartner: async ({ partnerID, approvedUserId }) => {
    try {
      const res = await api.put('/AdminPartner/approve-partner', {
        partnerID,
        approvedUserId,
      });
      return res.data;
    } catch (error) {
      console.error('Approve partner error:', error);
      throw error;
    }
  },

  rejectPartner: async ({ partnerID, rejectionReason }) => {
    try {
      const res = await api.put('/AdminPartner/reject-partner', {
        partnerID,
        rejectionReason,
      });
      return res.data;
    } catch (error) {
      console.error('Reject partner error:', error);
      throw error;
    }
  },

  deletePartner: async (id) => {
    try {
      const res = await api.delete(`/AdminPartner/delete-partner/${id}`);
      return res.data;
    } catch (error) {
      console.error('Delete partner error:', error);
      throw error;
    }
  },
};

export default partnerService;

import api from '../api';

const partnerService = {
  createPartner: async (partnerData) => {
    try {
      // Log data trước khi gửi để debug
      console.log('Raw partner data:', partnerData);

      // Validate data trước khi gửi
      if (!partnerData.partnerType || !partnerData.companyName || !partnerData.email || !partnerData.phoneNumber) {
        throw new Error('Missing required fields');
      }

      // Chuẩn hóa data theo format backend expect
      const requestPayload = {
        partnerType: String(partnerData.partnerType).trim(),
        companyName: String(partnerData.companyName).trim(),
        email: String(partnerData.email).trim().toLowerCase(),
        phoneNumber: String(partnerData.phoneNumber).trim(),
        description: partnerData.description ? String(partnerData.description).trim() : '',
        // Chỉ gửi imageUrls và imagePublicIds nếu có dữ liệu
        ...(partnerData.imageUrls && partnerData.imageUrls.length > 0 && {
          imageUrls: partnerData.imageUrls,
          imagePublicIds: partnerData.imagePublicIds || []
        })
      };

      console.log('Formatted request payload:', requestPayload);

      const response = await api.post('/Partners/create-partner', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Create partner response:', response);
      return response.data;
    } catch (error) {
      console.error('Create partner error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  // ... other methods remain the same
  getAllPartners: async (params = {}) => {
    try {
      const filteredParams = {};
      
      if (params.page && params.page > 0) {
        filteredParams.page = params.page;
      }
      if (params.pageSize && params.pageSize > 0) {
        filteredParams.pageSize = params.pageSize;
      }
      if (params.searchTerm && params.searchTerm.trim()) {
        filteredParams.searchTerm = params.searchTerm.trim();
      }
      if (params.status && params.status !== '') {
        filteredParams.status = params.status;
      }

      const response = await api.get('/Partners/get-all-partners', { 
        params: filteredParams 
      });
      return response.data;
    } catch (error) {
      console.error('Get partners error:', error);
      throw error;
    }
  },

  getPartnerById: async (id) => {
    try {
      const response = await api.get(`/Partners/get-partner/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get partner by ID error:', error);
      throw error;
    }
  },

  approvePartner: async (approveData) => {
    try {
      const response = await api.put('/Partners/approve-partner', {
        partnerID: approveData.partnerID,
        approvedUserId: approveData.approvedUserId
      });
      return response.data;
    } catch (error) {
      console.error('Approve partner error:', error);
      throw error;
    }
  },

  rejectPartner: async (rejectData) => {
    try {
      const response = await api.put('/Partners/reject-partner', {
        partnerID: rejectData.partnerID,
        rejectionReason: rejectData.rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Reject partner error:', error);
      throw error;
    }
  },

  deletePartner: async (id) => {
    try {
      const response = await api.delete(`/Partners/delete-partner/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete partner error:', error);
      throw error;
    }
  },
};

export default partnerService;

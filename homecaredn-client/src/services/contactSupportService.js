import api from './public/api';

export const contactSupportService = {
  // ====================== ADMIN ======================
  getAll: async (params) => {
    const response = await api.get('/contactact-supports', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contactact-supports/${id}`);
    return response.data;
  },

  reply: async (dto) => {
    // dto = { ID: guid, ReplyContent: string }
    const response = await api.put('/contactact-supports/reply', dto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contactact-supports/${id}`);
    return response.data;
  },

  // ====================== ANONYMOUS ======================
  create: async (dto) => {
    // dto = { FullName, Email, Subject, Message }
    const response = await api.post('/contactact-supports', dto);
    return response.data;
  },
};

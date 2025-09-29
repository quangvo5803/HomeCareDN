// src/services/contactService.js
import api from '../api';

export const contactService = {
  // ===== Public APIs =====
  create: async ({ fullName, email, subject, message }) => {
    const response = await api.post('/Support/create-support', {
      fullName,
      email,
      subject,
      message,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Support/get-support/${id}`);
    return response.data;
  },

  // ===== Admin APIs =====
  listAll: async (params = {}) => {
    const response = await api.get(`/AdminSupport/get-all-support`, { params });
    return response.data;
  },

  reply: async ({ id, replyContent }) => {
    const response = await api.post('/AdminSupport/reply-support', {
      id,
      replyContent,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/AdminSupport/delete-support/${id}`);
    return response.data;
  },
};

// src/services/contactService.js
import api from '../api';

export const contactService = {
  // ===== Public APIs =====
  create: async ({ fullName, email, subject, message }) => {
    const response = await api.post('/Support/create', {
      fullName,
      email,
      subject,
      message,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Support/${id}`);
    return response.data;
  },

  // ===== Admin APIs =====
  listAll: async (isProcessed) => {
    const query =
      isProcessed === undefined ? '' : `?isProcessed=${isProcessed}`;
    const response = await api.get(`/Admin/support/list${query}`);
    return response.data;
  },

  reply: async ({ id, replyContent }) => {
    const response = await api.post('/Admin/support/reply', {
      id,
      replyContent,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/Admin/support/delete/${id}`);
    return response.data;
  },
};

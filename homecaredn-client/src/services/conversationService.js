import api from './public/api';

export const conversationService = {
  getConversationByID: async (id) => {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
  getConversationByUserID: async (id) => {
    const res = await api.get(`/conversations/user/${id}`);
    return res.data;
  },
  getAllConversationsByAdminID: async (params) => {
    const res = await api.get(`/conversations/admin`, { params });
    return res.data;
  },
  markAsRead: async (id) => {
    api.post(`/conversations/mark-as-read/${id}`);
  },
};

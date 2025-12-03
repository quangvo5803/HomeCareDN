import api from './public/api';

export const conversationService = {
  getConversationByID: async (params) => {
    const respone = await api.get(`/conversations`, { params });
    return respone.data;
  },
  getConversationByUserID: async (id) => {
    const respone = await api.get(`/conversations/user/${id}`);
    return respone.data;
  },
  getAllConversationsByAdminID: async (params) => {
    const respone = await api.get(`/conversations/admin`, { params });
    return respone.data;
  },
  markAsRead: async (id) => {
    api.post(`/conversations/admin/mark-as-read/${id}`);
  },
  getUnreadConversationCount: async (id) => {
    const respone = await api.get(
      `/conversations/admin/get-unread-conversation/${id}`
    );
    return respone.data;
  },
};

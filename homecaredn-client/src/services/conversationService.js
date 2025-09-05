import api from '../api';

/**
 * Human chat giữa Customer & Contractor
 * Backend route: /api/Conversations/...
 */
export const conversationService = {
  start: async ({ customerId, contractorId, firstMessage }) => {
    const res = await api.post('/Conversations/start', {
      customerId,
      contractorId,
      firstMessage,
    });
    return res.data; // ConversationDto
  },

  mine: async () => {
    const res = await api.get('/Conversations/mine');
    return res.data; // ConversationDto[]
  },

  getMessages: async ({ conversationId, page = 1, pageSize = 50 }) => {
    const res = await api.get(`/Conversations/${conversationId}/messages`, {
      params: { page, pageSize },
    });
    return res.data; // ChatMessageDto[]
  },

  sendMessage: async ({ conversationId, receiverId, content }) => {
    const res = await api.post(`/Conversations/${conversationId}/send`, {
      conversationId,
      receiverId,
      content,
    });
    return res.data; // ChatMessageDto
  },

  markAsRead: async ({ conversationId }) => {
    const res = await api.post(`/Conversations/${conversationId}/read`);
    return res.data;
  },

  close: async ({ conversationId }) => {
    const res = await api.post(`/Conversations/${conversationId}/close`);
    return res.data;
  },
};

import api from './public/api';

export const chatMessageService = {
  getMessagesByConversationID: async (
    conversationId,
    pageNumber = 1,
    pageSize = 20
  ) => {
    const res = await api.get(`/chat-messages/${conversationId}`, {
      params: { pageNumber, pageSize },
    });
    return res.data;
  },
  sendMessage: async (messageData) => {
    const res = await api.post('/chat-messages', messageData);
    return res.data;
  },
};

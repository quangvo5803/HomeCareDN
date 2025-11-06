import api from './public/api';

export const chatMessageService = {
  getMessagesByConversation: async (conversationId) => {
    const res = await api.get(`/chat-messages/${conversationId}`);
    return res.data;
  },
  sendMessage: async (messageData) => {
    const res = await api.post('/chat-messages', messageData);
    return res.data;
  },
};

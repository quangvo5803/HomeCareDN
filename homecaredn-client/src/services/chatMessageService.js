import api from './public/api';

export const chatMessageService = {
  getMessagesByConversationID: async (params) => {
    const res = await api.get(`/chat-messages`, { params });
    return res.data;
  },
  sendMessage: async (dto) => {
    const res = await api.post('/chat-messages', dto);
    return res.data;
  },
  sendMessageToAdmin: async (dto) => {
    const res = await api.post('/chat-messages/send-admin', dto);
    return res.data;
  },
};

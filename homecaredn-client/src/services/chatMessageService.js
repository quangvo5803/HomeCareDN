import api from './public/api';

export const chatMessageService = {
  getMessagesByConversationID: async (params) => {
    const respone = await api.get(`/chat-messages`, { params });
    return respone.data;
  },
  sendMessage: async (dto) => {
    const respone = await api.post('/chat-messages', dto);
    return respone.data;
  },
  sendMessageToAdmin: async (dto) => {
    const respone = await api.post('/chat-messages/send-admin', dto);
    return respone.data;
  },
  sendMessageToUser: async (dto) => {
    const respone = await api.post('/chat-messages/send-user', dto);
    return respone.data;
  },
};

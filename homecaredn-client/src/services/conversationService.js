import api from './public/api';

export const conversationService = {
  createConversation: async (conversationData) => {
    const res = await api.post('/conversations', conversationData);
    return res.data;
  },
  getConversationById: async (id) => {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
};

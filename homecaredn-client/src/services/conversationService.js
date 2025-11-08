import api from './public/api';

export const conversationService = {
  getConversationByID: async (id) => {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
};

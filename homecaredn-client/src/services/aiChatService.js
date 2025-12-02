import api from '../services/public/api';

export const aiChatService = {
  chat: async (dto) => {
    const response = await api.post('/aiChat/chat', dto);
    return response.data;
  },

  suggest: async (input) => {
    const response = await api.post('/aiChat/suggest', { prompt: input });
    return response.data;
  },

  estimate: async (dto) => {
    const response = await api.post('/aiChat/estimate', dto);
    return response.data;
  },
};

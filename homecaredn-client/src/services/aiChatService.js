import api from '../services/public/api';

export const aiChatService = {
  chat: async (dto) => {
    const response = await api.post('/aiChat/chat', dto);
    return response.data;
  },

  suggest: async (dto) => {
    const response = await api.post('/aiChat/suggest', dto);
    return response.data;
  },

  searchWithAi: async (dto) => {
    const response = await api.post('/aiChat/search-ai', dto);
    return response.data;
  },
  estimate: async (dto) => {
    const response = await api.post('/aiChat/estimate', dto);
    return response.data;
  },
};

import api from '../services/public/api';

export const aiChatService = {
  send: async (input) => {
    const payload = typeof input === 'string' ? { prompt: input } : input;
    const res = await api.post('/AiChat/send', payload, {
      withCredentials: true,
    });
    return res.data;
  },

  history: async () => {
    const res = await api.get('/AiChat/history', { withCredentials: true });
    return res.data;
  },

  clear: async () => {
    await api.delete('/AiChat/history', { withCredentials: true });
    return true;
  },
};

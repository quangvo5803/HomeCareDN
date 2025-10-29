import api from '../services/public/api';

export const aiChatService = {
  send: async (input) => {
    const body =
      typeof input === 'string' ? { prompt: input } : { prompt: input?.prompt };

    const res = await api.post('/AiChat/send', body, { withCredentials: true });
    return res.data;
  },

  history: async () => {
    const res = await api.get('/AiChat/history', { withCredentials: true });
    return res.data;
  },

  clear: async () => {
    const res = await api.delete('/AiChat/history', { withCredentials: true });
    return res.data;
  },
};

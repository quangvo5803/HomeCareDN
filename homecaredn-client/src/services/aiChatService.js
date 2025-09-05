import api from '../api';

export const aiChatService = {
  send: async (input) => {
    const body = typeof input === 'string'
      ? { prompt: input }
      : { prompt: input?.prompt }; // bỏ system phía FE, backend hiện chưa dùng

    const res = await api.post('/AiChat/send', body, { withCredentials: true });
    return res.data; // { reply, history }
  },

  history: async () => {
    const res = await api.get('/AiChat/history', { withCredentials: true });
    return res.data; // [{ role, content, timestampUtc }, ...]
  },

  clear: async () => {
    const res = await api.delete('/AiChat/history', { withCredentials: true });
    return res.data;
  },
};

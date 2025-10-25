import api from '../api';
export const support = {
  listAllSupport: async (params = {}) => {
    const response = await api.get(`/AdminSupport/get-all-support`, { params });
    return response.data;
  },
  getSupportById: async (id) => {
    const response = await api.get(`/AdminSupport/get-support/${id}`);
    return response.data;
  },
  replySupport: async ({ id, replyContent }) => {
    const response = await api.post('/AdminSupport/reply-support', {
      id,
      replyContent,
    });
    return response.data;
  },

  deleteSupport: async (id) => {
    const response = await api.delete(`/AdminSupport/delete-support/${id}`);
    return response.data;
  },
};

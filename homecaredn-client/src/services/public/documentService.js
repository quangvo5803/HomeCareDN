import api from './api';
export const documentService = {
  delete: async (documentUrl) => {
    const response = await api.delete(
      `/documents?documentUrl=${encodeURIComponent(documentUrl)}`
    );
    return response.data;
  },
};

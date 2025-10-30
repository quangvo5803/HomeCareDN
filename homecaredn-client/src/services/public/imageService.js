import api from './api';
export const imageService = {
  delete: async (imageUrl) => {
    const response = await api.delete(
      `/images?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return response.data;
  },
};

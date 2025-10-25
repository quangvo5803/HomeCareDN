import api from '../api';
export const image = {
  deleteImage: async (imageUrl) => {
    const response = await api.delete(
      `/Public/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return response.data;
  },
};

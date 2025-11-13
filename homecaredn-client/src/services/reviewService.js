import api from './public/api';

export const reviewService = {
  getAll: async (params) => {
    const response = await api.get('/reviews/get-all-reviews', { params });
    return response.data;
  },

  create: async (dto) => {
    // dto
    // {
    //   UserID: string,
    //   ServiceRequestID?: string,
    //   MaterialRequestID?: string,
    //   PartnerID?: string,
    //   Rating: number,
    //   Comment?: string,
    //   ImageUrls?: string[],
    //   ImagePublicIds?: string[]
    // }
    const response = await api.post('/reviews', dto);
    return response.data;
  },
};

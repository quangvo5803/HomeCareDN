import api from '../../api';

export const brandService = {
  getAllBrands: async () => {
    const response = await api.get('/Admin/get-all-brands');
    return response.data;
  },

  getBrandById: async (id) => {
    const response = await api.get(`/Admin/get-brand/${id}`);
    return response.data;
  },

  createBrand: async ({ BrandName, BrandDescription, LogoFile }) => {
    const formData = new FormData();
    formData.append('BrandName', BrandName);
    if (BrandDescription) formData.append('BrandDescription', BrandDescription);
    formData.append('LogoFile', LogoFile);

    const response = await api.post('/Admin/create-brand', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBrand: async ({ BrandID, BrandName, BrandDescription, LogoFile }) => {
    const formData = new FormData();
    formData.append('BrandID', BrandID);
    formData.append('BrandName', BrandName);
    if (BrandDescription) formData.append('BrandDescription', BrandDescription);
    if (LogoFile) formData.append('LogoFile', LogoFile);

    const response = await api.put('/Admin/update-brand', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`/Admin/delete-brand/${id}`);
    return response.data;
  },
};

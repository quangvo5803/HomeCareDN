import api from '../api';

export const brandService = {
  //Public APIs
  getAllBrands: async () => {
    const response = await api.get('/Brands/get-all-brands');
    return response.data;
  },

  getBrandById: async (id) => {
    const response = await api.get(`/Brands/get-brand/${id}`);
    return response.data;
  },

  //Admin-only APIs
  createBrand: async ({
    BrandName,
    BrandDescription,
    BrandNameEN,
    BrandDescriptionEN,
    LogoFile,
  }) => {
    const formData = new FormData();
    formData.append('BrandName', BrandName);
    if (BrandDescription) formData.append('BrandDescription', BrandDescription);
    if (BrandNameEN) formData.append('BrandNameEN', BrandNameEN);
    if (BrandDescriptionEN)
      formData.append('BrandDescriptionEN', BrandDescriptionEN);
    formData.append('LogoFile', LogoFile);

    const response = await api.post('/Admin/create-brand', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBrand: async ({
    BrandID,
    BrandName,
    BrandDescription,
    BrandNameEN,
    BrandDescriptionEN,
    LogoFile,
  }) => {
    const formData = new FormData();
    formData.append('BrandID', BrandID);
    formData.append('BrandName', BrandName);
    if (BrandDescription) formData.append('BrandDescription', BrandDescription);
    if (BrandNameEN) formData.append('BrandNameEN', BrandNameEN);
    if (BrandDescriptionEN)
      formData.append('BrandDescriptionEN', BrandDescriptionEN);
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

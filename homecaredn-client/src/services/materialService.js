import api from '../api';

// 🔹 Hàm dùng chung để build FormData
const buildMaterialFormData = ({
  MaterialID,
  UserID,
  CategoryID,
  Name,
  NameEN,
  BrandID,
  Unit,
  UnitEN,
  Description,
  DescriptionEN,
  ImageUrls,
  ImagePublicIds,
}) => {
  const formData = new FormData();
  if (MaterialID) formData.append('MaterialID', MaterialID);
  if (UserID) formData.append('UserID', UserID);
  if (CategoryID) formData.append('CategoryID', CategoryID);
  if (Name) formData.append('Name', Name);
  if (NameEN) formData.append('NameEN', NameEN);
  if (BrandID) formData.append('BrandID', BrandID);
  if (Unit) formData.append('Unit', Unit);
  if (UnitEN) formData.append('UnitEN', UnitEN);
  if (Description) formData.append('Description', Description);
  if (DescriptionEN) formData.append('DescriptionEN', DescriptionEN);
  if (ImageUrls && ImageUrls.length > 0) {
    ImageUrls.forEach((file) => formData.append('ImageUrls', file));
  }
  if (ImagePublicIds && ImagePublicIds.length > 0) {
    for (const id of ImagePublicIds) {
      formData.append('ImagePublicIds', id);
    }
  }
  return formData;
};

export const materialService = {
  //Public APIs
  getAllMaterial: async (params = {}) => {
    const response = await api.get('/Material/get-all-material', { params });
    return response.data;
  },
  getMaterialById: async (id) => {
    const response = await api.get(`/Material/get-material/${id}`);
    return response.data;
  },

  //Admin-only APIs
  getAllMaterialByUserId: async (params = {}) => {
    const response = await api.get(
      `/DistributorMaterial/get-all-material-by-userid`,
      {
        params,
      }
    );
    return response.data;
  },

  createMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.post(
      '/DistributorMaterial/create-material',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  updateMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.put(
      '/DistributorMaterial/update-material',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(
      `/DistributorMaterial/delete-material/${id}`
    );
    return response.data;
  },

  deleteMaterialImage: async (imageUrl) => {
    const response = await api.delete(
      `/Images/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return response.data;
  },
};

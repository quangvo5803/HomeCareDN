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

  // Map fields 1-1
  const simpleFields = {
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
  };

  for (const [key, value] of Object.entries(simpleFields)) {
    if (value) {
      formData.append(key, value);
    }
  }

  // Handle arrays
  if (Array.isArray(ImageUrls)) {
    for (const file of ImageUrls) {
      formData.append('ImageUrls', file);
    }
  }

  if (Array.isArray(ImagePublicIds)) {
    for (const id of ImagePublicIds) {
      formData.append('ImagePublicIds', id);
    }
  }

  return formData;
};

export const materialService = {
  // Public APIs
  getAllMaterial: async (params = {}) => {
    const response = await api.get('/Material/get-all-material', { params });
    return response.data;
  },

  getMaterialById: async (id) => {
    const response = await api.get(`/Material/get-material/${id}`);
    return response.data;
  },

  getMaterialByCategory: async (id) => {
    const response = await api.get(`/Material/get-material-bycategory/${id}`);
    return response.data;
  },

  getMaterialByBrand: async (id) => {
    const response = await api.get(`/Material/get-material-bybrand/${id}`);
    return response.data;
  },

  // Authenticated APIs (Admin / Distributor)
  getAllMaterialByUserId: async (params = {}) => {
    const response = await api.get('/Material/get-all-material-by-userid', {
      params,
    });
    return response.data;
  },

  createMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.post('/Material/create-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.put('/Material/update-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/Material/delete-material/${id}`);
    return response.data;
  },

  deleteMaterialImage: async (imageUrl) => {
    const response = await api.delete(
      `/Images/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return response.data;
  },
};

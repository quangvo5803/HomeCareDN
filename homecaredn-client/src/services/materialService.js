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
  UnitPrice,
  Images,
}) => {
  const formData = new FormData();
  if (MaterialID) formData.append('MaterialID', MaterialID);
  if (UserID) formData.append('UserID', UserID);
  if (CategoryID) formData.append('CategoryID', CategoryID);
  formData.append('Name', Name);
  if (NameEN) formData.append('NameEN', NameEN);
  if (BrandID) formData.append('BrandID', BrandID);
  if (Unit) formData.append('Unit', Unit);
  if (UnitEN) formData.append('UnitEN', UnitEN);
  if (Description) formData.append('Description', Description);
  if (DescriptionEN) formData.append('DescriptionEN', DescriptionEN);
  if (UnitPrice !== undefined) formData.append('UnitPrice', UnitPrice);
  if (Images && Images.length > 0) {
    Images.forEach((file) => formData.append('Images', file));
  }
  return formData;
};

export const materialService = {
  //Public APIs
  getAllMaterial: async () => {
    const response = await api.get('/Material/get-all-material');
    return response.data;
  },
  getMaterialById: async (id) => {
    const response = await api.get(`/Material/get-material/${id}`);
    return response.data;
  },

  //Admin-only APIs
  getAllMaterialById: async (id) => {
    const response = await api.get(`/Distributor/get-all-material-by-id/${id}`);
    return response.data;
  },

  createMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.post('/Distributor/create-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.put('/Distributor/update-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/Distributor/delete-material/${id}`);
    return response.data;
  },

  deleteMaterialImage: async (materialId, imageId) => {
    const response = await api.delete(
      `/Distributor/delete-material-image/${materialId}/images/${imageId}`
    );
    return response.data;
  },
};

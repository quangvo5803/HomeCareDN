import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

const buildMaterialFormData = (material) => {
  const formData = new FormData();

  // ID (chỉ dùng khi update)
  appendIf(formData, 'MaterialID', material.MaterialID);
  // Các field cơ bản
  appendIf(formData, 'UserID', material.UserID);
  appendIf(formData, 'CategoryID', material.CategoryID);
  appendIf(formData, 'Name', material.Name);
  appendIf(formData, 'NameEN', material.NameEN);
  appendIf(formData, 'BrandID', material.BrandID);
  appendIf(formData, 'Unit', material.Unit);
  appendIf(formData, 'UnitEN', material.UnitEN);
  appendIf(formData, 'Description', material.Description);
  appendIf(formData, 'DescriptionEN', material.DescriptionEN);

  // Mảng ảnh
  for (const url of material.ImageUrls || []) {
    formData.append('ImageUrls', url);
  }

  for (const id of material.ImagePublicIds || []) {
    formData.append('ImagePublicIds', id);
  }

  return formData;
};

export const material = {
  createMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.post(
      '/AdminMaterial/create-material',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  updateMaterial: async (data) => {
    const formData = buildMaterialFormData(data);
    const response = await api.put('/AdminMaterial/update-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/AdminMaterial/delete-material/${id}`);
    return response.data;
  },
};

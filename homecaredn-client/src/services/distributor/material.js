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
  (material.ImageUrls || []).forEach((url) =>
    formData.append('ImageUrls', url)
  );
  (material.ImagePublicIds || []).forEach((id) =>
    formData.append('ImagePublicIds', id)
  );

  return formData;
};
export const material = {
  getAllMaterialByUserId: async (params = {}) => {
    const response = await api.get(
      '/DistributorMaterial/get-all-material-by-userid',
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
};

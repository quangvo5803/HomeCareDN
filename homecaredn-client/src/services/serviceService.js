import api from '../api';

// 🔹 Hàm dùng chung để build FormData cho Service
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

const buildServiceFormData = (service) => {
  const formData = new FormData();

  // Những field string/optional
  const stringFields = [
    'ServiceID',
    'Name',
    'NameEN',
    'Description',
    'DescriptionEN',
  ];
  stringFields.forEach(key => {
    appendIf(formData, key, service[key]);
  });

  // Những field có thể là number / enum, cần check null/undefined
  const enumFields = [
    'ServiceType',
    'PackageOption',
    'BuildingType',
    'MainStructureType',
    'DesignStyle',
  ];
  enumFields.forEach((key) => {
    if (service[key] !== undefined && service[key] !== null && service[key] !== '') {
      formData.append(key, service[key]);
    }
  });

  // Images
  (service.ImageUrls || []).forEach(ImageUrls => formData.append('ImageUrls', ImageUrls));
  (service.ImagePublicIds || []).forEach(ImagePublicIds => formData.append('ImagePublicIds', ImagePublicIds));

  return formData;
};

export const serviceService = {
  // 🔹 Public APIs
  getAllService: async (params = {}) => {
    const response = await api.get('/Services/get-all-services', { params });
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/Services/get-service/${id}`);
    return response.data;
  },

  // 🔹 Admin-only APIs
  createService: async (data) => {
    const formData = buildServiceFormData(data);
    const response = await api.post('/Admin/create-service', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateService: async (data) => {
    const formData = buildServiceFormData(data);
    const response = await api.put('/Admin/update-service', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/Admin/delete-service/${id}`);
    return response.data;
  },

  deleteServiceImage: async (imageUrl) => {
    const response = await api.delete(
      `/Images/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return response.data;
  },
};

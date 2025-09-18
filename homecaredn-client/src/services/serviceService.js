import api from '../api';

// 🔹 Hàm dùng chung để build FormData cho Service
const buildServiceFormData = ({
  ServiceID,
  Name,
  NameEN,
  ServiceType,
  PackageOption,
  BuildingType,
  MainStructureType,
  DesignStyle,
  Description,
  DescriptionEN,
  Images,
}) => {
  const formData = new FormData();

  if (ServiceID) formData.append('ServiceID', ServiceID);

  if (Name) formData.append('Name', Name);
  if (NameEN) formData.append('NameEN', NameEN);

  if (ServiceType !== undefined && ServiceType !== null) {
    formData.append('ServiceType', ServiceType);
  }
  if (PackageOption !== undefined && PackageOption !== null) {
    formData.append('PackageOption', PackageOption);
  }
  if (BuildingType !== undefined && BuildingType !== null) {
    formData.append('BuildingType', BuildingType);
  }
  if (MainStructureType !== undefined && MainStructureType !== null) {
    formData.append('MainStructureType', MainStructureType);
  }
  if (DesignStyle !== undefined && DesignStyle !== null) {
    formData.append('DesignStyle', DesignStyle);
  }

  if (Description) formData.append('Description', Description);
  if (DescriptionEN) formData.append('DescriptionEN', DescriptionEN);

  if (Images && Images.length > 0) {
    Images.forEach((file) => formData.append('Images', file));
  }

  return formData;
};
export const serviceService = {
  // 🔹 Public APIs
  getAllService: async (params = {}) => {
    const response = await api.get('/Service/get-all-service', { params });
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/Service/get-service/${id}`);
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

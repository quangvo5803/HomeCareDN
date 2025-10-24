import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};
const buildServiceFormData = (service) => {
  const formData = new FormData();

  // ID (chỉ dùng khi update)
  appendIf(formData, 'ServiceID', service.ServiceID);

  // Required fields
  appendIf(formData, 'Name', service.Name);
  appendIf(formData, 'ServiceType', service.ServiceType);
  appendIf(formData, 'BuildingType', service.BuildingType);
  // Optional fields
  appendIf(formData, 'NameEN', service.NameEN);
  appendIf(formData, 'PackageOption', service.PackageOption);
  appendIf(formData, 'MainStructureType', service.MainStructureType);
  appendIf(formData, 'DesignStyle', service.DesignStyle);
  appendIf(formData, 'Description', service.Description);
  appendIf(formData, 'DescriptionEN', service.DescriptionEN);

  // Images
  (service.ImageUrls || []).forEach((ImageUrls) =>
    formData.append('ImageUrls', ImageUrls)
  );
  (service.ImagePublicIds || []).forEach((ImagePublicIds) =>
    formData.append('ImagePublicIds', ImagePublicIds)
  );

  return formData;
};
export const service = {
  createService: async (data) => {
    const formData = buildServiceFormData(data);
    const response = await api.post('/AdminService/create-service', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateService: async (data) => {
    const formData = buildServiceFormData(data);
    const response = await api.put('/AdminService/update-service', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/AdminService/delete-service/${id}`);
    return response.data;
  },
};

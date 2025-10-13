import api from '../api';

// 🔹 Hàm append an toàn
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

// 🔹 Build FormData cho ServiceRequest
const buildServiceRequestFormData = (serviceRequest) => {
  const formData = new FormData();

  // ID (chỉ dùng khi update)
  appendIf(formData, 'ServiceRequestID', serviceRequest.ServiceRequestID);

  // Required fields
  appendIf(formData, 'CustomerID', serviceRequest.CustomerID);
  appendIf(formData, 'AddressID', serviceRequest.AddressID);
  appendIf(formData, 'ServiceType', serviceRequest.ServiceType);
  appendIf(formData, 'PackageOption', serviceRequest.PackageOption);
  appendIf(formData, 'BuildingType', serviceRequest.BuildingType);
  appendIf(formData, 'MainStructureType', serviceRequest.MainStructureType);
  appendIf(formData, 'Width', serviceRequest.Width);
  appendIf(formData, 'Length', serviceRequest.Length);
  appendIf(formData, 'Floors', serviceRequest.Floors);
  // Optional fields
  appendIf(formData, 'DesignStyle', serviceRequest.DesignStyle);
  appendIf(formData, 'EstimatePrice', serviceRequest.EstimatePrice);
  appendIf(formData, 'Description', serviceRequest.Description);

  // 🔹 Images từ cloud (string list)
  (serviceRequest.ImageUrls || []).forEach((url) =>
    formData.append('ImageUrls', url)
  );
  (serviceRequest.ImagePublicIds || []).forEach((id) =>
    formData.append('ImagePublicIds', id)
  );

  return formData;
};

export const serviceRequestService = {
  // ================== Public APIs ==================
  getAllServiceRequest: async (params = {}) => {
    const res = await api.get('/ServiceRequest/get-all-servicerequest', {
      params,
    });
    return res.data;
  },

  getServiceRequestById: async (id) => {
    const res = await api.get(`/ServiceRequest/get-servicerequest-byid/${id}`);
    return res.data;
  },

  // ================== Customer APIs ==================
  getAllServiceRequestByUserId: async (params = {}) => {
    const res = await api.get(
      '/CustomerServiceRequest/get-all-servicerequest-byuserid',
      {
        params,
      }
    );
    return res.data;
  },

  createServiceRequest: async (data) => {
    const formData = buildServiceRequestFormData(data);
    const res = await api.post(
      '/CustomerServiceRequest/create-servicerequest',
      formData
    );
    return res.data;
  },

  updateServiceRequest: async (data) => {
    const formData = buildServiceRequestFormData(data);
    const res = await api.put(
      '/CustomerServiceRequest/update-servicerequest',
      formData
    );
    return res.data;
  },

  deleteServiceRequest: async (id) => {
    const res = await api.delete(
      `/CustomerServiceRequest/delete-servicerequest/${id}`
    );
    return res.data;
  },

  deleteServiceRequestImage: async (imageUrl) => {
    const res = await api.delete(
      `/Images/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return res.data;
  },
};

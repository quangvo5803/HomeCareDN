import api from './api';

// 🔹 Hàm dùng chung để build FormData cho Service
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

const buildMaterialRequestFormData = (data) => {
  const formData = new FormData();

  appendIf(formData, 'CustomerID', data.CustomerID);
  appendIf(formData, 'FirstMaterialID', data.FirstMaterialID);
  appendIf(formData, 'Description', data.Description);
  appendIf(formData, 'CanEditQuantity', data.CanEditQuantity);
  appendIf(formData, 'MaterialRequestID', data.MaterialRequestID);
  // AddItems (array)
  if (Array.isArray(data.AddItems)) {
    formData.append('AddItems', JSON.stringify(data.AddItems));
  }

  // UpdateItems (array)
  if (Array.isArray(data.UpdateItems)) {
    formData.append('UpdateItems', JSON.stringify(data.UpdateItems));
  }

  // DeleteItemIDs (array of Guid)
  if (Array.isArray(data.DeleteItemIDs)) {
    formData.append('DeleteItemIDs', JSON.stringify(data.DeleteItemIDs));
  }

  return formData;
};
export const materialRequestService = {
  getAllMaterialRequest: async (params = {}) => {
    const res = await api.get('/MaterialRequests/get-all-material-request', {
      params,
    });
    return res.data;
  },
  getAllMaterialRequestByUserId: async (params = {}) => {
    const res = await api.get(
      '/CustomerMaterialRequests/get-all-material-request-by-user-id',
      { params }
    );
    return res.data;
  },
  getMaterialRequestById: async (id) => {
    const response = await api.get(
      `/MaterialRequests/get-material-request-by-id/${id}`
    );
    return response.data;
  },
  // 🔹 Create new MaterialRequest
  createMaterialRequest: async (data) => {
    const formData = buildMaterialRequestFormData(data);
    const res = await api.post(
      '/CustomerMaterialRequests/create-material-request',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // 🔹 Update (batch add/update/delete items, description, canEdit)
  updateMaterialRequest: async (data) => {
    const formData = buildMaterialRequestFormData(data);
    const res = await api.put(
      '/CustomerMaterialRequests/update-service-request',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // 🔹 Delete MaterialRequest by ID
  deleteMaterialRequest: async (id) => {
    const res = await api.delete(
      `/CustomerMaterialRequests/delete-material-request/${id}`
    );
    return res.data;
  },
};

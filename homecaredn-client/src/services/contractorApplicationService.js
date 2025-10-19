import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};

const buildContractorFormData = (contractor) => {
  const formData = new FormData();

  appendIf(
    formData,
    'ContractorApplicationID',
    contractor.ContractorApplicationID
  );

  // Required fields
  appendIf(formData, 'ServiceRequestID', contractor.ServiceRequestID);
  appendIf(formData, 'ContractorID', contractor.ContractorID);
  appendIf(formData, 'Description', contractor.Description);
  appendIf(formData, 'EstimatePrice', contractor.EstimatePrice);
  appendIf(formData, 'CreatedAt', contractor.CreatedAt);
  appendIf(formData, 'Status', contractor.Status);

  // Images
  for (const url of contractor.ImageUrls ?? []) {
    formData.append('ImageUrls', url);
  }

  for (const publicId of contractor.ImagePublicIds ?? []) {
    formData.append('ImagePublicIds', publicId);
  }
  return formData;
};

export const contractorApplicationService = {
  createContractorApplication: async (contractorData) => {
    const formData = buildContractorFormData(contractorData);
    const response = await api.post(
      '/ContractorApplication/create-contractor-request',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  getApplication: async (getRequest) => {
    const response = await api.get(
      '/ContractorApplication/get-contractor-application',
      {
        params: getRequest,
      }
    );
    return response.data;
  },

  acceptContractorApplication: async (contractorApplicationId) => {
    const res = await api.put(
      `/ContractorApplication/accept-contractor-application/${contractorApplicationId}`
    );
    return res.data;
  },

  rejectContractorApplication: async (contractorApplicationId) => {
    const res = await api.put(
      `/ContractorApplication/reject-contractor-application/${contractorApplicationId}`
    );
    return res.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(
      `/ContractorApplication/delete-contractor-application/${id}`
    );
    return response.data;
  },
};

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

  //Documents
  for (const url of contractor.DocumentUrls ?? []) {
    formData.append('DocumentUrls', url);
  }

  for (const publicId of contractor.DocumentPublicIds ?? []) {
    formData.append('DocumentPublicIds', publicId);
  }

  return formData;
};
<<<<<<< HEAD:homecaredn-client/src/services/contractorApplicationService.js

export const contractorApplicationService = {
=======
export const contractorApplication = {
  // Contractor Service Request
  getAllServiceRequest: async (params = {}) => {
    const res = await api.get(
      '/ContractorServiceRequest/get-all-service-request',
      {
        params,
      }
    );
    return res.data;
  },
  ///Contractor Application
>>>>>>> develop:homecaredn-client/src/services/contractor/constactorApplication.js
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

  getContractorApplicationByServiceRequestIDAndContractorID: async (
    getRequest
  ) => {
    const response = await api.get(
      '/ContractorApplication/get-contractor-application',
      {
        params: getRequest,
      }
    );
    return response.data;
  },
  deleteApplication: async (id) => {
    const response = await api.delete(
      `/ContractorApplication/delete-contractor-application/${id}`
    );
    return response.data;
  },
};

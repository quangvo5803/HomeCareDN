import api from '../api';
const appendIf = (fd, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    fd.append(key, value);
  }
};
export const partnerRequest = {
  createPartnerRequest: async (partnerRequestData) => {
    const formData = new FormData();
    appendIf(
      formData,
      'PartnerRequestType',
      partnerRequestData.PartnerRequestType
    );
    appendIf(formData, 'CompanyName', partnerRequestData.CompanyName);
    appendIf(formData, 'Email', partnerRequestData.Email);
    appendIf(formData, 'PhoneNumber', partnerRequestData.PhoneNumber);
    appendIf(formData, 'Description', partnerRequestData.Description);

    for (const imageUrl of partnerRequestData.ImageUrls || []) {
      formData.append('ImageUrls', imageUrl);
    }

    for (const publicId of partnerRequestData.ImagePublicIds || []) {
      formData.append('ImagePublicIds', publicId);
    }

    const res = await api.post('/Public/create-partner-request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

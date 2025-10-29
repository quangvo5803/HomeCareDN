import api from '../api';
export const support = {
  createSupport: async ({ fullName, email, subject, message }) => {
    const response = await api.post('/Public/create-support', {
      fullName,
      email,
      subject,
      message,
    });
    return response.data;
  },
};

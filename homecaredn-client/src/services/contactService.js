import api from "../api";

export const contactService = {
  // user
  create: (data) => api.post("/support/create", data),
  getDetail: (id) => api.get(`/support/${id}`),
  getById: (id) => api.get(`/support/${id}`),

  // admin
  listAll: (isProcessed) =>
    api.get(
      `/Admin/support/list${
        isProcessed !== undefined ? `?isProcessed=${isProcessed}` : ""
      }`
    ),
  reply: (id, data) => api.post(`/Admin/support/reply/${id}`, data),
  delete: (id) => api.delete(`/Admin/support/delete/${id}`),
};

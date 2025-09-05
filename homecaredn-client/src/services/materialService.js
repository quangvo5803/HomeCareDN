import api from "../api";

export const materialService = {
  //Public APIs
  getAllMaterial: async () => {
    const response = await api.get("/Material/get-all-material");
    return response.data;
  },

  getMaterialById: async (id) => {
    const response = await api.get(`/Material/get-material/${id}`);
    return response.data;
  },

  //Admin-only APIs
  createMaterial: async ({
    UserID,
    CategoryID,
    Name,
    BrandID,
    Unit,
    Description,
    UnitPrice,
    Images,
  }) => {
    const formData = new FormData();
    formData.append("UserID", UserID);
    formData.append("CategoryID", CategoryID);
    formData.append("Name", Name);
    if (BrandID) formData.append("BrandID", BrandID);
    if (Unit) formData.append("Unit", Unit);
    if (Description) formData.append("Description", Description);
    formData.append("UnitPrice", UnitPrice);
    formData.append("Images", Images);

    const response = await api.post("/Distributor/create-material", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateMaterial: async ({
    MaterialID,
    CategoryID,
    Name,
    BrandID,
    Unit,
    Description,
    UnitPrice,
    Images,
  }) => {
    const formData = new FormData();
    formData.append("MaterialID", MaterialID);
    formData.append("CategoryID", CategoryID);
    formData.append("Name", Name);
    if (BrandID) formData.append("BrandID", BrandID);
    if (Unit) formData.append("Unit", Unit);
    if (Description) formData.append("Description", Description);
    formData.append("UnitPrice", UnitPrice);
    formData.append("Images", Images);

    const response = await api.put("/Distributor/update-material", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/Distributor/delete-material/${id}`);
    return response.data;
  },
};

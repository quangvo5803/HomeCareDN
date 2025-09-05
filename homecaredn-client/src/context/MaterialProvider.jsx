import { useEffect, useState, useCallback, useMemo, Children } from "react";
import { materialService } from "../services/materialService";
import { useAuth } from "../hook/useAuth";
import MaterialContext from "./MaterialContext";
import { toast } from "react-toastify";
import { handleApiError } from "../utils/handleApiError";
import PropTypes from "prop-types";

export const MaterialProvider = ({ children }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all material
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await materialService.getAllMaterial();
      setMaterials(data);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Public: get brand by id
  const getMaterialById = useCallback(async (id) => {
    try {
      return await materialService.getMaterialById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Admin-only: create
  const createMaterial = useCallback(
    async (materialData) => {
      if (user?.role !== "Distributor") throw new Error("Unauthorized");
      try {
        setLoading(true);
        const newMaterial = await materialService.createBrand(materialData);
        setMaterials((prev) => [...prev, newMaterial]);
        return newMaterial;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // 📌 Admin-only: update
  const updateMaterial = useCallback(
    async (materialData) => {
      if (user?.role !== "Distributor") throw new Error("Unauthorized");
      try {
        setLoading(true);
        const updated = await materialService.updateMaterial(materialData);
        setMaterials((prev) =>
          prev.map((b) =>
            b.MaterialID === updated.materialID
              ? {
                  ...b,
                  ...updated,
                  images: updated.images ?? b.images,
                }
              : b
          )
        );
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // 📌 Admin-only: delete
  const deleteMaterial = useCallback(
    async (id) => {
      if (user?.role !== "Distributor") throw new Error("Unauthorized");
      try {
        await materialService.deleteMaterial(id);
        setMaterials((prev) => prev.filter((b) => b.materialID !== id));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  // 📌 Load brands khi user login, reset khi logout
  useEffect(() => {
    if (user) fetchMaterials();
    else setMaterials([]);
  }, [user, fetchMaterials]);

  const contextValue = useMemo(
    () => ({
      materials,
      loading,
      fetchMaterials,
      getMaterialById,
      createMaterial,
      updateMaterial,
      deleteMaterial,
    }),
    [
      materials,
      loading,
      fetchMaterials,
      getMaterialById,
      createMaterial,
      updateMaterial,
      deleteMaterial,
    ]
  );

  return (
    <MaterialContext.Provider value={contextValue}>
      {children}
    </MaterialContext.Provider>
  );
};
MaterialProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

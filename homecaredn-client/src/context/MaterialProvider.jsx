import { useState, useCallback, useMemo } from 'react';
import { materialService } from '../services/materialService';
import { useAuth } from '../hook/useAuth';
import MaterialContext from './MaterialContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const MaterialProvider = ({ children }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all material
  const fetchMaterials = useCallback(
    async ({ PageNumber = 1, PageSize = 10 } = {}) => {
      try {
        setLoading(true);
        const data = await materialService.getAllMaterial({
          PageNumber,
          PageSize,
        });
        setMaterials(data.items || []);
        setTotalMaterials(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 📌 Public: get material by id
  const getMaterialById = useCallback(
    async (id) => {
      var local = materials.find((m) => m.materialID === id);
      if (local) return local;
      try {
        return await materialService.getMaterialById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [materials]
  );
  // 📌 Distributor-only: get all by user id
  const fetchMaterialsByUserId = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      if (user?.role !== 'Distributor') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const data = await materialService.getAllMaterialByUserId({
          PageNumber,
          PageSize,
          FilterID,
        });
        setMaterials(data.items || []);
        setTotalMaterials(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );
  // 📌 Distributor-only: create
  const createMaterial = useCallback(
    async (materialData) => {
      if (user?.role !== 'Distributor') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newMaterial = await materialService.createMaterial(materialData);
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

  // 📌 Distributor-only: update
  const updateMaterial = useCallback(
    async (materialData) => {
      if (user?.role !== 'Distributor') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await materialService.updateMaterial(materialData);
        setMaterials((prev) =>
          prev.map((m) =>
            m.materialID === updated.materialID
              ? {
                  ...m,
                  ...updated,
                  images: updated.images ?? m.images,
                }
              : m
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

  // 📌 Distributor-only: delete
  const deleteMaterial = useCallback(
    async (id) => {
      if (user?.role !== 'Distributor') throw new Error('Unauthorized');
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

  // 📌 Distributor-only: delete material image
  const deleteMaterialImage = useCallback(
    async (materialId, imageId) => {
      if (user?.role !== 'Distributor') throw new Error('Unauthorized');
      try {
        await materialService.deleteMaterialImage(materialId, imageId);

        // update materials
        const updateImages = (m) => {
          if (m.materialID !== materialId) return m;
          return {
            ...m,
            images: m.images.filter((img) => img.imageID !== imageId),
          };
        };

        setMaterials((prev) => prev.map(updateImages));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  const contextValue = useMemo(
    () => ({
      materials,
      totalMaterials,
      loading,
      fetchMaterials,
      fetchMaterialsByUserId,
      getMaterialById,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      deleteMaterialImage,
    }),
    [
      materials,
      totalMaterials,
      loading,
      fetchMaterials,
      fetchMaterialsByUserId,
      getMaterialById,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      deleteMaterialImage,
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

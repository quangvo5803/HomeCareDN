import { useState, useCallback, useMemo } from 'react';
import { publicService } from '../services/publicService';
import getServiceByRole from '../services/getServiceByRole';
import { useAuth } from '../hook/useAuth';
import MaterialContext from './MaterialContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

export const MaterialProvider = ({ children }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all material
  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterID,
      FilterCategoryID,
      FilterBrandID,
      Search,
    } = {}) => {
      try {
        const data = await publicService.material.getAllMaterial({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          FilterCategoryID,
          FilterBrandID,
          Search,
        });

        const itemsWithType = (data.items || []).map((m) => ({
          ...m,
          type: 'material',
        }));

        setMaterials(itemsWithType);
        setTotalMaterials(data.totalCount || 0);
        return itemsWithType;
      } catch (err) {
        toast.error(handleApiError(err));
        setMaterials([]);
        setTotalMaterials(0);
        return [];
      }
    },
    []
  );

  const fetchMaterials = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );
  // 📌 Public: get material by id
  const getMaterialById = useCallback(async (id) => {
    try {
      setLoading(true);
      return await publicService.material.getMaterialById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  // 📌 Distributor-only: get all by user id
  const executeFetchById = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      if (
        !user?.role ||
        (user.role !== 'Distributor' && user.role !== 'Admin')
      ) {
        toast.error('Unauthorized');
        return { items: [], totalCount: 0 };
      }

      try {
        const service = getServiceByRole(user.role);
        const data = await service.material.getAllMaterialByUserId({
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
      }
    },
    [user?.role]
  );

  // Gọi có min loading
  const fetchMaterialsByUserId = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetchById(params), setLoading);
    },
    [executeFetchById]
  );
  // 📌 Distributor-only: create
  const createMaterial = useCallback(
    async (materialData) => {
      try {
        setLoading(true);
        const service = getServiceByRole(user.role);
        const newMaterial = await service.material.createMaterial(materialData);
        // Tăng tổng số material
        setMaterials((prev) => [...prev, newMaterial]);
        setTotalMaterials((prev) => prev + 1);
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
      try {
        setLoading(true);
        const service = getServiceByRole(user.role);
        const updated = await service.material.updateMaterial(materialData);
        setMaterials((prev) =>
          prev.map((m) =>
            m.materialID === updated.materialID
              ? {
                  ...m,
                  ...updated,
                  imageUrls: updated.imageUrls ?? m.imageUrls,
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
      try {
        const service = getServiceByRole(user.role);
        await service.material.deleteMaterial(id);
        setMaterials((prev) => prev.filter((b) => b.materialID !== id));
        setTotalMaterials((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  // 📌 Distributor-only: delete material image
  const deleteMaterialImage = useCallback(async (materialId, imageUrl) => {
    try {
      const service = getServiceByRole();
      await service.image.deleteMaterialImage(imageUrl);

      // update materials
      const updateImages = (m) => {
        if (m.materialID !== materialId) return m;
        return {
          ...m,
          imageUrls: m.imageUrls.filter((imgUrl) => imgUrl !== imageUrl),
        };
      };

      setMaterials((prev) => prev.map(updateImages));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

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

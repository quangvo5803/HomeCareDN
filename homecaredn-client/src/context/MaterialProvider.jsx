import { useState, useCallback, useMemo } from 'react';
import { materialService } from '../services/materialService';
import { imageService } from '../services/public/imageService';
import MaterialContext from './MaterialContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';
export const MaterialProvider = ({ children }) => {
  const { t } = useTranslation();
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
        const data = await materialService.getAll({
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
      var result = await materialService.getById(id);
      return result;
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);
  // 📌 Distributor-only: get all by user id
  const executeFetchById = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      try {
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
      }
    },
    []
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
        const newMaterial = await materialService.create(materialData);
        // Tăng tổng số material
        setMaterials((prev) => [...prev, newMaterial]);
        setTotalMaterials((prev) => prev + 1);
        toast.success(t('SUCCESS.MATERIAL_ADD'));
        return newMaterial;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t]
  );

  // 📌 Distributor-only: update
  const updateMaterial = useCallback(
    async (materialData) => {
      try {
        const updated = await materialService.update(materialData);
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
        toast.success(t('SUCCESS.MATERIAL_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t]
  );

  // 📌 Distributor-only: delete
  const deleteMaterial = useCallback(async (id) => {
    try {
      await materialService.deleteMaterial(id);
      setMaterials((prev) => prev.filter((b) => b.materialID !== id));
      setTotalMaterials((prev) => prev - 1);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  }, []);

  // 📌 Distributor-only: delete material image
  const deleteMaterialImage = useCallback(async (materialId, imageUrl) => {
    try {
      await imageService.delete(imageUrl);
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

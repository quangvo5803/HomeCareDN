import { useState, useCallback, useMemo, useEffect } from 'react';
import { materialRequestService } from '../services/materialRequestService';
import { useAuth } from '../hook/useAuth';
import MaterialRequestContext from './MaterialRequestContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const MaterialRequestProvider = ({ children }) => {
  const { user } = useAuth();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [totalMaterialRequests, setTotalMaterialRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMaterialRequests = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      try {
        setLoading(true);
        const data = await materialRequestService.getAllMaterialRequest({
          PageNumber,
          PageSize,
          FilterID,
        });
        setMaterialRequests(data.items || []);
        setTotalMaterialRequests(data.totalCount || 0);
        return data.items || [];
      } catch (err) {
        toast.error(handleApiError(err));
        setMaterialRequests([]);
        setTotalMaterialRequests(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getMaterialRequestById = useCallback(async (id) => {
    try {
      setLoading(true);
      return await materialRequestService.getMaterialById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMaterialRequestsByUserId = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      if (!user) return { items: [], totalCount: 0 };
      try {
        setLoading(true);
        const data = await materialRequestService.getAllMaterialRequestByUserId(
          {
            PageNumber,
            PageSize,
            FilterID,
          }
        );
        setMaterialRequests(data.items || []);
        setTotalMaterialRequests(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const createMaterialRequest = useCallback(
    async (materialData) => {
      if (!user) return null;
      try {
        setLoading(true);
        const newMaterial = await materialRequestService.createMaterialRequest(
          materialData
        );
        // Tăng tổng số material
        setMaterialRequests((prev) => [...prev, newMaterial]);
        setTotalMaterialRequests((prev) => prev + 1);
        return newMaterial;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // 📌 Distributor-only: update
  const updateMaterialRequest = useCallback(
    async (materialData) => {
      if (!user) return null;
      try {
        setLoading(true);
        const updated = await materialRequestService.updateMaterialRequest(
          materialData
        );
        setMaterialRequests((prev) =>
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
    [user]
  );

  const deleteMaterialRequest = useCallback(
    async (id) => {
      if (!user) return null;

      try {
        await materialRequestService.deleteMaterialRequest(id);
        setMaterialRequests((prev) =>
          prev.filter((b) => b.materialRequestID !== id)
        );
        setTotalMaterialRequests((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user]
  );
  //Load data
  useEffect(() => {
    if (!user) {
      setMaterialRequests([]);
      setTotalMaterialRequests(0);
      return;
    }
    fetchMaterialRequestsByUserId({ FilterID: user?.id });
  }, [user, fetchMaterialRequestsByUserId]);

  const contextValue = useMemo(
    () => ({
      materialRequests,
      totalMaterialRequests,
      loading,
      fetchMaterials: fetchMaterialRequests,
      fetchMaterialRequestsByUserId,
      getMaterialRequestById,
      createMaterialRequest,
      updateMaterialRequest,
      deleteMaterialRequest,
    }),
    [
      materialRequests,
      totalMaterialRequests,
      loading,
      fetchMaterialRequests,
      fetchMaterialRequestsByUserId,
      getMaterialRequestById,
      createMaterialRequest,
      updateMaterialRequest,
      deleteMaterialRequest,
    ]
  );

  return (
    <MaterialRequestContext.Provider value={contextValue}>
      {children}
    </MaterialRequestContext.Provider>
  );
};
MaterialRequestProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

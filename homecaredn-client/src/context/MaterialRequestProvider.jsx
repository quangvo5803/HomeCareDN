import { useState, useCallback, useMemo, useEffect } from 'react';
import { materialRequestService } from '../services/materialRequestService';
import { useAuth } from '../hook/useAuth';
import MaterialRequestContext from './MaterialRequestContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { withMinLoading } from '../utils/withMinLoading';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const MaterialRequestProvider = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [totalMaterialRequests, setTotalMaterialRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // ==================== FETCH ====================
  const executeFetch = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, FilterID } = {}) => {
      try {
        let data;
        if (user?.role === 'Admin') {
          data = await materialRequestService.getAllForAdmin({
            PageNumber,
            PageSize,
            SortBy,
            FilterID,
          });
        } else if (user?.role === 'Distributor') {
          data = await materialRequestService.getAllForDistributor({
            PageNumber,
            PageSize,
            SortBy,
            FilterID: user.id,
          });
        } else if (user?.role === 'Customer') {
          data = await materialRequestService.getAllForCustomer({
            PageNumber,
            PageSize,
            SortBy,
            FilterID: user.id,
          });
        } else {
          return { items: [], totalCount: 0 };
        }

        setMaterialRequests(data.items || []);
        setTotalMaterialRequests(data.totalCount || 0);
        return data.items || [];
      } catch (err) {
        toast.error(handleApiError(err));
        setMaterialRequests([]);
        setTotalMaterialRequests(0);
        return [];
      }
    },
    [user]
  );

  const fetchMaterialRequests = useCallback(
    async (params = {}) =>
      withMinLoading(() => executeFetch(params), setLoading),
    [executeFetch]
  );

  // ==================== GET BY ID ====================
  const getMaterialRequestById = useCallback(
    async (id) => {
      if (!user) return null;
      const dto = {
        MaterialRequestID: id,
        DistributorID: user.role === 'Distributor' ? user.id : undefined,
      };
      try {
        let result;
        if (user.role === 'Admin') {
          result = await materialRequestService.getByIdForAdmin(dto);
        } else if (user.role === 'Distributor') {
          result = await materialRequestService.getByIdForDistributor(dto);
        } else if (user.role === 'Customer') {
          result = await materialRequestService.getByIdForCustomer(dto);
        } else return null;

        return result;
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [user]
  );

  // ==================== CREATE ====================
  const createMaterialRequest = useCallback(
    async (dto) => {
      try {
        if (!user) return null;
        const created = await materialRequestService.createForCustomer(dto);
        setMaterialRequests((prev) => [created, ...prev]);
        setTotalMaterialRequests((prev) => prev + 1);
        toast.success(t('SUCCESS.MATERIAL_REQUEST_ADD'));
        return created;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t, user]
  );

  // ==================== UPDATE ====================
  const updateMaterialRequest = useCallback(
    async (dto) => {
      try {
        if (!user) return null;
        const updated = await materialRequestService.updateForCustomer(dto);
        setMaterialRequests((prev) =>
          prev.map((m) =>
            m.materialRequestID === updated.materialRequestID
              ? { ...m, ...updated }
              : m
          )
        );
        toast.success(t('SUCCESS.MATERIAL_REQUEST_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t, user]
  );

  // ==================== DELETE ====================
  const deleteMaterialRequest = useCallback(
    async (id) => {
      try {
        if (!user) return;
        await materialRequestService.deleteForCustomer(id);
        setMaterialRequests((prev) =>
          prev.filter((m) => m.materialRequestID !== id)
        );
        setTotalMaterialRequests((prev) => Math.max(0, prev - 1));
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [user]
  );

  // ==================== AUTO LOAD ====================
  useEffect(() => {
    if (!user) {
      setMaterialRequests([]);
      setTotalMaterialRequests(0);
      return;
    }
    if (user.role === 'Customer' && materialRequests.length === 0 && !loading) {
      fetchMaterialRequests({ PageNumber: 1, PageSize: 10, FilterID: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchMaterialRequests]);

  // ==================== CONTEXT VALUE ====================
  const contextValue = useMemo(
    () => ({
      materialRequests,
      totalMaterialRequests,
      loading,
      fetchMaterialRequests,
      setMaterialRequests,
      setTotalMaterialRequests,
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
      setMaterialRequests,
      setTotalMaterialRequests,
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

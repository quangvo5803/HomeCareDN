import { useState, useCallback, useMemo, useEffect } from 'react';
import { materialRequestService } from '../services/materialRequestService';
import { useAuth } from '../hook/useAuth';
import MaterialRequestContext from './MaterialRequestContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';

export const MaterialRequestProvider = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [totalMaterialRequests, setTotalMaterialRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // ================== CHỌN API THEO ROLE ==================
  const getAllByRole = useCallback(
    async (params = {}) => {
      if (!user) return { items: [], totalCount: 0 };
      switch (user.role) {
        case 'Admin':
          return await materialRequestService.getAllForAdmin(params);
        case 'Distributor':
          return await materialRequestService.getAllForDistributor(params);
        case 'Customer':
          return await materialRequestService.getAllForCustomer(params);
        default:
          return { items: [], totalCount: 0 };
      }
    },
    [user]
  );

  const getByIdByRole = useCallback(
    async (id) => {
      if (!user) return null;
      switch (user.role) {
        case 'Admin':
          return await materialRequestService.getByIdForAdmin(id);
        case 'Distributor':
          return await materialRequestService.getByIdForDistributor(id);
        case 'Customer':
          return await materialRequestService.getByIdForCustomer(id);
        default:
          return null;
      }
    },
    [user]
  );

  // ================== FETCH ==================
  const executeFetch = useCallback(
    async (params = {}) => {
      try {
        const data = await getAllByRole(params);
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
    [getAllByRole]
  );

  const fetchMaterialRequests = useCallback(
    async (params = {}) =>
      await withMinLoading(() => executeFetch(params), setLoading),
    [executeFetch]
  );

  // ================== GET BY ID ==================
  const getMaterialRequestById = useCallback(
    async (id) => {
      const local = materialRequests.find((m) => m.materialRequestID === id);
      if (local) return local;
      try {
        return await getByIdByRole(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [materialRequests, getByIdByRole]
  );

  // ================== CRUD ==================
  const createMaterialRequest = useCallback(
    async (dto) => {
      try {
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
    [t]
  );

  const updateMaterialRequest = useCallback(
    async (dto) => {
      try {
        const updated = await materialRequestService.updateForCustomer(dto);
        setMaterialRequests((prev) =>
          prev.map((m) =>
            m.materialRequestID === updated.materialRequestID
              ? { ...m, ...updated }
              : m
          )
        );
        toast.success('Cập nhật yêu cầu thành công');
        return updated;
      } catch (err) {
        toast.error(t('SUCCESS.MATERIAL_REQUEST_UPDATE'));
        throw err;
      }
    },
    [t]
  );

  const deleteMaterialRequest = useCallback(async (id) => {
    try {
      await materialRequestService.deleteForCustomer(id);
      setMaterialRequests((prev) =>
        prev.filter((m) => m.materialRequestID !== id)
      );
      setTotalMaterialRequests((prev) => Math.max(prev - 1, 0));
      toast.success('Xóa yêu cầu thành công');
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // ================== TỰ ĐỘNG LOAD THEO USER ==================
  useEffect(() => {
    if (!user) {
      setMaterialRequests([]);
      setTotalMaterialRequests(0);
      return;
    }
    fetchMaterialRequests();
  }, [user, fetchMaterialRequests]);

  // ================== CONTEXT VALUE ==================
  const contextValue = useMemo(
    () => ({
      materialRequests,
      totalMaterialRequests,
      loading,
      fetchMaterialRequests,
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

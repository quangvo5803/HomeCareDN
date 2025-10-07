import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { partnerRequestService } from '../services/partnerRequestService';
import { useAuth } from '../hook/useAuth';
import PartnerRequestContext from './PartnerRequestContext';
export const PartnerRequestProvider = ({ children }) => {
  const { user } = useAuth();

  const [partnerRequests, setPartnerRequests] = useState([]);
  const [totalPartnerRequests, setTotalPartnerRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Public: lấy danh sách (paging/sort/filter tương tự Service) */
  const fetchPartnerRequests = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterID,
      FilterPartnerRequestStatus,
      Search,
    } = {}) => {
      try {
        setLoading(true);
        const data = await partnerRequestService.getAllPartnerRequests({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          FilterPartnerRequestStatus,
          Search,
        });
        const items = data?.items || [];
        setPartnerRequests(items);
        setTotalPartnerRequests(data?.totalCount ?? 0);
        return items;
      } catch (err) {
        toast.error(handleApiError(err));
        setPartnerRequests([]);
        setTotalPartnerRequests(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createPartnerRequest = useCallback(async (partnerRequestData) => {
    try {
      setLoading(true);
      const newPartnerRequest =
        await partnerRequestService.createPartnerRequest(partnerRequestData);
      // Tăng tổng số material
      setPartnerRequests((prev) => [...prev, newPartnerRequest]);
      setTotalPartnerRequests((prev) => prev + 1);
      return newPartnerRequest;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  /** Public: lấy chi tiết */
  const getPartnerRequestById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const local = partnerRequests.find((p) => p.partnerRequestID === id);
        if (local) return local;
        return await partnerRequestService.getPartnerRequestById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [partnerRequests]
  );

  /** Admin: duyệt */
  const approvePartnerRequest = useCallback(
    async (PartnerRequestID) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerRequestService.approvePartnerRequest(
          PartnerRequestID
        );
        setPartnerRequests((prev) =>
          prev.map((p) =>
            p.partnerRequestID === updated.partnerRequestID
              ? { ...p, ...updated }
              : p
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

  /** Admin: từ chối */
  const rejectPartnerRequest = useCallback(
    async (rejectData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerRequestService.rejectPartnerRequest(
          rejectData
        );
        setPartnerRequests((prev) =>
          prev.map((p) =>
            p.partnerRequestID === updated.partnerRequestID
              ? { ...p, ...updated }
              : p
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

  /** Admin: xoá */
  const deletePartnerRequest = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await partnerRequestService.deletePartnerRequest(id);
        setPartnerRequests((prev) =>
          prev.filter((p) => p.partnerRequestID !== id)
        );
        setTotalPartnerRequests((prev) => Math.max(0, prev - 1));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  const contextValue = useMemo(
    () => ({
      partnerRequests,
      totalPartnerRequests,
      loading,
      fetchPartnerRequests,
      getPartnerRequestById,
      createPartnerRequest,
      approvePartnerRequest,
      rejectPartnerRequest,
      deletePartnerRequest,
    }),
    [
      partnerRequests,
      totalPartnerRequests,
      loading,
      fetchPartnerRequests,
      getPartnerRequestById,
      createPartnerRequest,
      approvePartnerRequest,
      rejectPartnerRequest,
      deletePartnerRequest,
    ]
  );

  return (
    <PartnerRequestContext.Provider value={contextValue}>
      {children}
    </PartnerRequestContext.Provider>
  );
};

PartnerRequestProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

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
      FilterPartnerStatus,
      Search,
    } = {}) => {
      try {
        setLoading(true);
        const data = await partnerRequestService.getAllPartnerRequests({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          FilterPartnerStatus,
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

  /** Public: lấy chi tiết */
  const getPartnerRequestById = useCallback(
    async (id) => {
      const local = partnerRequests.find((p) => p.partnerID === id);
      if (local) return local;
      try {
        return await partnerRequestService.getPartnerRequestById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [partnerRequests]
  );

  /** Admin: duyệt */
  const approvePartnerRequest = useCallback(
    async ({ partnerID, approvedUserId }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerRequestService.approvePartnerRequest({
          partnerID,
          approvedUserId,
        });
        setPartnerRequests((prev) =>
          prev.map((p) =>
            p.partnerID === updated.partnerID ? { ...p, ...updated } : p
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
    async ({ partnerID, rejectionReason }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerRequestService.rejectPartnerReuquest({
          partnerID,
          rejectionReason,
        });
        setPartnerRequests((prev) =>
          prev.map((p) =>
            p.partnerID === updated.partnerID ? { ...p, ...updated } : p
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
        setPartnerRequests((prev) => prev.filter((p) => p.partnerID !== id));
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

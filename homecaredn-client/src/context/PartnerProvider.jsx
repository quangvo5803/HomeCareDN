import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import partnerService from '../services/partnerService';
import { useAuth } from '../hook/useAuth';
import PartnerContext from './PartnerContext';

export const PartnerProvider = ({ children }) => {
  const { user } = useAuth();

  const [partners, setPartners] = useState([]);
  const [totalPartners, setTotalPartners] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Public: lấy danh sách (paging/sort/filter tương tự Service) */
  const fetchPartners = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterString,
    } = {}) => {
      try {
        setLoading(true);
        const data = await partnerService.getAllPartners({
          PageNumber,
          PageSize,
          SortBy,
          FilterString,
        });

        // Chuẩn hoá casing từ BE
        const items =
          (data?.items ?? data?.Items ?? []).map((p) => ({ ...p, type: 'partner' }));

        setPartners(items);
        setTotalPartners(data?.totalCount ?? data?.TotalCount ?? 0);
        return items;
      } catch (err) {
        toast.error(handleApiError(err));
        setPartners([]);
        setTotalPartners(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Public: lấy chi tiết */
  const getPartnerById = useCallback(
    async (id) => {
      const local = partners.find((p) => p.partnerID === id);
      if (local) return local;
      try {
        return await partnerService.getPartnerById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [partners]
  );

  /** Admin: duyệt */
  const approvePartner = useCallback(
    async ({ partnerID, approvedUserId }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerService.approvePartner({ partnerID, approvedUserId });
        setPartners((prev) =>
          prev.map((p) => (p.partnerID === updated.partnerID ? { ...p, ...updated } : p))
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
  const rejectPartner = useCallback(
    async ({ partnerID, rejectionReason }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerService.rejectPartner({ partnerID, rejectionReason });
        setPartners((prev) =>
          prev.map((p) => (p.partnerID === updated.partnerID ? { ...p, ...updated } : p))
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
  const deletePartner = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await partnerService.deletePartner(id); // 204 No Content
        setPartners((prev) => prev.filter((p) => p.partnerID !== id));
        setTotalPartners((prev) => Math.max(0, prev - 1));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  const contextValue = useMemo(
    () => ({
      partners,
      totalPartners,
      loading,
      fetchPartners,
      getPartnerById,
      approvePartner,
      rejectPartner,
      deletePartner,
    }),
    [
      partners,
      totalPartners,
      loading,
      fetchPartners,
      getPartnerById,
      approvePartner,
      rejectPartner,
      deletePartner,
    ]
  );

  return <PartnerContext.Provider value={contextValue}>{children}</PartnerContext.Provider>;
};

PartnerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

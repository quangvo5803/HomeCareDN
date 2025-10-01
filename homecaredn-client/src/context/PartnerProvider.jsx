import { useState, useCallback, useMemo } from 'react';
import { partnerService } from '../services/partnerService';
import { useAuth } from '../hook/useAuth';
import PartnerContext from './PartnerContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const PartnerProvider = ({ children }) => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [totalPartners, setTotalPartners] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Admin: lấy danh sách (paging/sort/filter tương tự Service) */
const fetchPartners = useCallback(
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
        const data = await partnerService.getAllPartners({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          FilterPartnerStatus,
          Search, 
        });
        const itemsWithStatus = (data.items || []).map((p) => ({ ...p ,type: 'partner',}));
        setPartners(itemsWithStatus || []);
        setTotalPartners(data?.totalCount || 0);
      return itemsWithStatus;
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

  /** Admin: lấy chi tiết */
  const getPartnerById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        return await partnerService.getPartnerById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },[]);

  /** Admin: duyệt */
  const approvePartner = useCallback(
    async ({ serviceData }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerService.approvePartner(serviceData);
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
    async ({ serviceData }) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await partnerService.rejectPartner(serviceData);
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

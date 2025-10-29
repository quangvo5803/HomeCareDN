import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { partnerRequestService } from '../services/partnerRequestService';
import { withMinLoading } from '../utils/withMinLoading';
import PartnerRequestContext from './PartnerRequestContext';

export const PartnerRequestProvider = ({ children }) => {
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [totalPartnerRequests, setTotalPartnerRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Fetch all (with pagination)
  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterID,
      FilterPartnerRequestStatus,
      Search,
    } = {}) => {
      try {
        const data = await partnerRequestService.getAll({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          FilterPartnerRequestStatus,
          Search,
        });
        const items = data.items || [];
        setPartnerRequests(items);
        setTotalPartnerRequests(data.totalCount || 0);
        return items;
      } catch (err) {
        toast.error(handleApiError(err));
        setPartnerRequests([]);
        setTotalPartnerRequests(0);
        return [];
      }
    },
    []
  );

  const fetchPartnerRequests = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );

  // 📌 Get by ID
  const getPartnerRequestById = useCallback(
    async (id) => {
      try {
        const local = partnerRequests.find((p) => p.partnerRequestID === id);
        if (local) return local;
        return await partnerRequestService.getById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [partnerRequests]
  );

  // 📌 Create (public)
  const createPartnerRequest = useCallback(async (dto) => {
    try {
      const newPartnerRequest = await partnerRequestService.create(dto);
      setPartnerRequests((prev) => [...prev, newPartnerRequest]);
      setTotalPartnerRequests((prev) => prev + 1);
      return newPartnerRequest;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Approve (Admin only)
  const approvePartnerRequest = useCallback(async (id) => {
    try {
      setLoading(true);
      const updated = await partnerRequestService.approve(id);
      setPartnerRequests((prev) =>
        prev.map((p) =>
          p.partnerRequestID === updated.partnerRequestID ? updated : p
        )
      );
      return updated;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Reject (Admin only)
  const rejectPartnerRequest = useCallback(async (rejectData) => {
    try {
      setLoading(true);
      const updated = await partnerRequestService.reject(rejectData);
      setPartnerRequests((prev) =>
        prev.map((p) =>
          p.partnerRequestID === updated.partnerRequestID ? updated : p
        )
      );
      return updated;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePartnerRequest = useCallback(async (id) => {
    try {
      setLoading(true);
      await partnerRequestService.delete(id);
      setPartnerRequests((prev) =>
        prev.filter((p) => p.partnerRequestID !== id)
      );
      setTotalPartnerRequests((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

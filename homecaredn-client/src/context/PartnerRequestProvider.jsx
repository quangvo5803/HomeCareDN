import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import getServiceByRole from '../services/getServiceByRole';
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
        const service = getServiceByRole('Admin');
        const data = await service.partnerRequest.getAllPartnerRequests({
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
        const service = getServiceByRole('Admin');
        return await service.partnerRequest.getPartnerRequestById(id);
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
      setLoading(true);
      const service = getServiceByRole();
      const newPartnerRequest =
        await service.partnerRequest.createPartnerRequest(dto);
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

  // 📌 Approve (Admin only)
  const approvePartnerRequest = useCallback(async (id) => {
    try {
      setLoading(true);
      const service = getServiceByRole('Admin');
      const updated = await service.partnerRequest.approvePartnerRequest(id);
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
      const service = getServiceByRole('Admin');
      const updated = await service.partnerRequest.rejectPartnerRequest(
        rejectData
      );
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
      const service = getServiceByRole('Admin');
      await service.partnerRequest.deletePartnerRequest(id);
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

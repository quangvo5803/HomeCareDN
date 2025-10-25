import { useState, useCallback, useMemo, useEffect } from 'react';
import getServiceByRole from '../services/getServiceByRole';
import { useAuth } from '../hook/useAuth';
import ServiceRequestContext from './ServiceRequestContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { withMinLoading } from '../utils/withMinLoading';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const ServiceRequestProvider = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [totalServiceRequests, setTotalServiceRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Execute fetch service requests
  const executeFetch = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, FilterID } = {}) => {
      try {
        const service = getServiceByRole(user?.role);
        const data = await service.serviceRequest.getAllServiceRequest({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
        });
        setServiceRequests(data.items || []);
        setTotalServiceRequests(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      }
    },
    [user?.role]
  );

  const fetchServiceRequests = useCallback(
    async (params = {}) =>
      await withMinLoading(() => executeFetch(params), setLoading),
    [executeFetch]
  );

  // 📌 Execute fetch service requests by user id
  const executeFetchByUserId = useCallback(
    async ({ PageNumber = 1, PageSize = 3, FilterID } = {}) => {
      try {
        const service = getServiceByRole(user?.role);
        const data = await service.serviceRequest.getAllServiceRequestByUserId({
          PageNumber,
          PageSize,
          FilterID,
        });
        setServiceRequests(data.items || []);
        setTotalServiceRequests(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      }
    },
    [user?.role]
  );

  const fetchServiceRequestsByUserId = useCallback(
    async (params = {}) =>
      await withMinLoading(() => executeFetchByUserId(params), setLoading),
    [executeFetchByUserId]
  );

  // 📌 Get by ID
  const getServiceRequestById = useCallback(
    async (id) => {
      try {
        const service = getServiceByRole(user?.role);
        return await service.serviceRequest.getServiceRequestById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [user?.role]
  );

  // 📌 Create
  const createServiceRequest = useCallback(
    async (dto) => {
      try {
        setLoading(true);
        const service = getServiceByRole('Customer');
        const newRequest = await service.serviceRequest.createServiceRequest(
          dto
        );
        setServiceRequests((prev) => [...prev, newRequest]);
        setTotalServiceRequests((prev) => prev + 1);
        toast.success(t('SUCCESS.SERVICE_REQUEST_ADD'));
        return newRequest;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // 📌 Update
  const updateServiceRequest = useCallback(
    async (dto) => {
      try {
        setLoading(true);
        const service = getServiceByRole('Customer');
        const updated = await service.serviceRequest.updateServiceRequest(dto);
        setServiceRequests((prev) =>
          prev.map((s) =>
            s.serviceRequestID === updated.serviceRequestID
              ? { ...s, ...updated }
              : s
          )
        );
        toast.success(t('SUCCESS.SERVICE_REQUEST_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // 📌 Delete
  const deleteServiceRequest = useCallback(async (id) => {
    try {
      const service = getServiceByRole('Customer');
      await service.serviceRequest.deleteServiceRequest(id);
      setServiceRequests((prev) =>
        prev.filter((s) => s.serviceRequestID !== id)
      );
      setTotalServiceRequests((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Delete image
  const deleteServiceRequestImage = useCallback(
    async (serviceRequestId, imageUrl) => {
      try {
        const service = getServiceByRole();
        await service.image.deleteImage(imageUrl);
        setServiceRequests((prev) =>
          prev.map((s) =>
            s.serviceRequestID === serviceRequestId
              ? {
                  ...s,
                  imageUrls: s.imageUrls.filter((img) => img !== imageUrl),
                }
              : s
          )
        );
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    []
  );

  // 📌 Auto load if user is Customer
  useEffect(() => {
    if (!user) {
      setServiceRequests([]);
      setTotalServiceRequests(0);
      return;
    }
    if (user.role === 'Customer') {
      fetchServiceRequestsByUserId({ FilterID: user.id });
    }
  }, [user, fetchServiceRequestsByUserId]);

  const contextValue = useMemo(
    () => ({
      serviceRequests,
      totalServiceRequests,

      loading,
      fetchServiceRequests,
      fetchServiceRequestsByUserId,
      getServiceRequestById,
      createServiceRequest,
      updateServiceRequest,
      deleteServiceRequest,
      deleteServiceRequestImage,
    }),
    [
      serviceRequests,
      totalServiceRequests,

      loading,
      fetchServiceRequests,
      fetchServiceRequestsByUserId,
      getServiceRequestById,
      createServiceRequest,
      updateServiceRequest,
      deleteServiceRequest,
      deleteServiceRequestImage,
    ]
  );

  return (
    <ServiceRequestContext.Provider value={contextValue}>
      {children}
    </ServiceRequestContext.Provider>
  );
};

ServiceRequestProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

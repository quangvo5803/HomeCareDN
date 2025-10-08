import { useState, useCallback, useMemo } from 'react';
import { serviceRequestService } from '../services/serviceRequestService';
import { useAuth } from '../hook/useAuth';
import ServiceRequestContext from './ServiceRequestContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const ServiceRequestProvider = ({ children }) => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [totalServiceRequests, setTotalServiceRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all service requests
  const fetchServiceRequests = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, FilterID } = {}) => {
      try {
        setLoading(true);
        const data = await serviceRequestService.getAllServiceRequest({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
        });
        setServiceRequests(data.items || []);
        setTotalServiceRequests(data.totalCount || 0);
        return data.items || [];
      } catch (err) {
        toast.error(handleApiError(err));
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 📌 Public: get by id
  const getServiceRequestById = useCallback(
    async (id) => {
      try {
        const local = serviceRequests.find((s) => s.serviceRequestID === id);
        if (local) return local;
        return await serviceRequestService.getServiceRequestById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [serviceRequests]
  );

  // 📌 Customer: get all by userId
  const fetchServiceRequestsByUserId = useCallback(
    async ({ PageNumber = 1, PageSize = 3, FilterID } = {}) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const data = await serviceRequestService.getAllServiceRequestByUserId({
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
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // 📌 Customer: create
  const createServiceRequest = useCallback(
    async (requestData) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newRequest = await serviceRequestService.createServiceRequest(
          requestData
        );
        setServiceRequests((prev) => [...prev, newRequest]);
        setTotalServiceRequests((prev) => prev + 1);
        return newRequest;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // 📌 Customer: update
  const updateServiceRequest = useCallback(
    async (requestData) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await serviceRequestService.updateServiceRequest(
          requestData
        );
        setServiceRequests((prev) =>
          prev.map((s) =>
            s.serviceRequestID === updated.serviceRequestID
              ? { ...s, ...updated }
              : s
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

  // 📌 Customer: delete
  const deleteServiceRequest = useCallback(
    async (id) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        await serviceRequestService.deleteServiceRequest(id);
        setServiceRequests((prev) =>
          prev.filter((s) => s.serviceRequestID !== id)
        );
        setTotalServiceRequests((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  // 📌 Customer: delete image
  const deleteServiceRequestImage = useCallback(
    async (serviceRequestId, imageUrl) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        await serviceRequestService.deleteServiceRequestImage(imageUrl);

        // update local state
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
    [user?.role]
  );

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

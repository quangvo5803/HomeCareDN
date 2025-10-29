import { useState, useCallback, useMemo, useEffect } from 'react';
<<<<<<< HEAD
import { serviceRequestService } from '../services/serviceRequestService';
import { imageService } from '../services/public/imageService';
=======
<<<<<<< HEAD
import { serviceRequestService } from '../services/serviceRequestService';
=======
import getServiceByRole from '../services/getServiceByRole';
>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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

  // ==================== FETCH ====================
  const executeFetch = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, FilterID } = {}) => {
      try {
        let data;
        if (user?.role === 'Admin') {
          data = await serviceRequestService.getAllForAdmin({
            PageNumber,
            PageSize,
            SortBy,
            FilterID,
          });
        } else if (user?.role === 'Customer') {
          data = await serviceRequestService.getAllForCustomer({
            PageNumber,
            PageSize,
            FilterID: user.id,
          });
        } else if (user?.role === 'Contractor') {
          data = await serviceRequestService.getAllForContractor({
            PageNumber,
            PageSize,
            SortBy,
            FilterID,
          });
        } else {
          return { items: [], totalCount: 0 };
        }

        const itemsWithType = (data.items || []).map((r) => ({
          ...r,
          type: 'serviceRequest',
        }));
        setServiceRequests(itemsWithType);
        setTotalServiceRequests(data.totalCount || 0);
        return itemsWithType;
      } catch (err) {
        toast.error(handleApiError(err));
        setServiceRequests([]);
        setTotalServiceRequests(0);
        return [];
      }
    },
    [user]
  );

<<<<<<< HEAD
  // 📌 Public: get by id
  const getServiceRequestById = useCallback(async (id) => {
    try {
      return await serviceRequestService.getServiceRequestById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Customer: get all by userId
  const fetchServiceRequestsByUserId = useCallback(
=======
  const fetchServiceRequests = useCallback(
    async (params = {}) =>
      withMinLoading(() => executeFetch(params), setLoading),
    [executeFetch]
  );

<<<<<<< HEAD
  // ==================== GET BY ID ====================
=======
  // 📌 Execute fetch service requests by user id
  const executeFetchByUserId = useCallback(
>>>>>>> develop
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
  const getServiceRequestById = useCallback(
    async (id) => {
      if (!user) return null;

      try {
        const dto = {
          ServiceRequestID: id,
          ContractorID: user.role === 'Contractor' ? user.id : undefined,
        };

        let result;
        if (user.role === 'Admin') {
          result = await serviceRequestService.getByIdForAdmin(dto);
        } else if (user.role === 'Customer') {
          result = await serviceRequestService.getByIdForCustomer(dto);
        } else if (user.role === 'Contractor') {
          result = await serviceRequestService.getByIdForContractor(dto);
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
  const createServiceRequest = useCallback(
    async (dto) => {
      try {
        if (!user) return null;
        const newRequest = await serviceRequestService.createForCustomer(dto);
        setServiceRequests((prev) => [newRequest, ...prev]);
        setTotalServiceRequests((prev) => prev + 1);
        toast.success(t('SUCCESS.SERVICE_REQUEST_ADD'));
        return newRequest;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t, user]
  );

  // ==================== UPDATE ====================
  const updateServiceRequest = useCallback(
    async (dto) => {
      try {
        if (!user) return null;
        const updated = await serviceRequestService.updateForCustomer(dto);
        setServiceRequests((prev) =>
          prev.map((r) =>
            r.serviceRequestID === updated.serviceRequestID
              ? { ...r, ...updated }
              : r
          )
        );
        toast.success(t('SUCCESS.SERVICE_REQUEST_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t, user]
  );

  // ==================== DELETE ====================
  const deleteServiceRequest = useCallback(
    async (id) => {
      try {
        if (!user) return;
        await serviceRequestService.deleteForCustomer(id);
        setServiceRequests((prev) =>
          prev.filter((r) => r.serviceRequestID !== id)
        );
        setTotalServiceRequests((prev) => Math.max(0, prev - 1));
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [user]
  );

  // ==================== DELETE IMAGE ====================
  const deleteServiceRequestImage = useCallback(
    async (serviceRequestId, imageUrl) => {
      try {
        await imageService.delete(imageUrl);
        setServiceRequests((prev) =>
          prev.map((r) =>
            r.serviceRequestID === serviceRequestId
              ? {
                  ...r,
                  imageUrls: r.imageUrls.filter((img) => img !== imageUrl),
                }
              : r
          )
        );
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    []
  );

<<<<<<< HEAD
  // ==================== AUTO LOAD ====================
=======
<<<<<<< HEAD
  const deleteServiceRequestDocument = useCallback(
    async (serviceRequestId, documentUrl) => {
      if (user?.role !== 'Customer') throw new Error('Unauthorized');
      try {
        // 1. Call the service
        await serviceRequestService.deleteServiceRequestDocument(documentUrl);

        // 2. Update local state
        setServiceRequests((prev) =>
          prev.map((s) =>
            s.serviceRequestID === serviceRequestId
              ? {
                  ...s,
                  // Filter out the deleted document URL
                  documentUrls: s.documentUrls.filter(
                    (doc) => doc !== documentUrl
                  ),
                  // Optionally filter publicIds if you store them in state
                  // documentPublicIds: s.documentPublicIds.filter(...)
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

=======
  // 📌 Auto load if user is Customer
>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
  useEffect(() => {
    if (!user) {
      setServiceRequests([]);
      setTotalServiceRequests(0);
      return;
    }
    if (user.role === 'Customer' && serviceRequests.length === 0 && !loading) {
      fetchServiceRequests({ PageNumber: 1, PageSize: 10, FilterID: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchServiceRequests]);

  // ==================== CONTEXT VALUE ====================
  const contextValue = useMemo(
    () => ({
      serviceRequests,
      totalServiceRequests,
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
      loading,
      fetchServiceRequests,
      setServiceRequests,
      setTotalServiceRequests,
      getServiceRequestById,
      createServiceRequest,
      updateServiceRequest,
      deleteServiceRequest,
      deleteServiceRequestImage,
      deleteServiceRequestDocument,
    }),
    [
      serviceRequests,
      totalServiceRequests,
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
      loading,
      fetchServiceRequests,
      setServiceRequests,
      setTotalServiceRequests,
      getServiceRequestById,
      createServiceRequest,
      updateServiceRequest,
      deleteServiceRequest,
      deleteServiceRequestImage,
      deleteServiceRequestDocument,
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

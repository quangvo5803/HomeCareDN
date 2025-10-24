import { useState, useCallback, useMemo } from 'react';
import getServiceByRole from '../services/getServiceByRole';
import ServiceContext from './ServiceContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

const handleServiceError = (err, fallback = null) => {
  toast.error(handleApiError(err));
  return fallback;
};

const mapServiceItems = (data) => {
  const items = data?.items ?? [];
  return items.map((s) => ({ ...s, type: 'service' }));
};

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- Internal helper: fetch data from API ---
  const fetchAllServices = async (params = {}) => {
    const service = getServiceByRole();
    return await service.service.getAllService(params);
  };

  // --- Execute Fetch with Loading Overlay ---
  const executeFetch = useCallback(async (params = {}) => {
    try {
      const data = await fetchAllServices(params);
      const mapped = mapServiceItems(data);
      setServices(mapped);
      setTotalServices(data.totalCount || 0);
      return mapped;
    } catch (err) {
      return handleServiceError(err, []);
    }
  }, []);

  const fetchServices = useCallback(
    async (params = {}) =>
      withMinLoading(() => executeFetch(params), setLoading),
    [executeFetch]
  );

  // --- Get by ID ---
  const getServiceById = useCallback(async (id) => {
    try {
      const service = getServiceByRole();
      return await service.service.getServiceById(id);
    } catch (err) {
      return handleServiceError(err);
    }
  }, []);

  // --- Create (Admin-only) ---
  const createService = useCallback(async (dto) => {
    setLoading(true);
    try {
      const service = getServiceByRole('Admin');
      const newService = await service.service.createService(dto);
      setServices((prev) => [...prev, newService]);
      setTotalServices((prev) => prev + 1);
      return newService;
    } catch (err) {
      handleServiceError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Update (Admin-only) ---
  const updateService = useCallback(async (dto) => {
    setLoading(true);
    try {
      const service = getServiceByRole();
      const updated = await service.service.updateService(dto);
      setServices((prev) =>
        prev.map((s) =>
          s.serviceID === updated.serviceID
            ? { ...s, ...updated, imageUrls: updated.imageUrls ?? s.imageUrls }
            : s
        )
      );
      return updated;
    } catch (err) {
      handleServiceError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Delete (Admin-only, no overlay) ---
  const deleteService = useCallback(async (id) => {
    try {
      const service = getServiceByRole('Admin');
      await service.service.deleteService(id);
      setServices((prev) => prev.filter((s) => s.serviceID !== id));
      setTotalServices((prev) => Math.max(0, prev - 1));
    } catch (err) {
      handleServiceError(err);
      throw err;
    }
  }, []);

  // --- Delete Image ---
  const deleteServiceImage = useCallback(async (serviceID, imageUrl) => {
    try {
      const service = getServiceByRole();
      await service.image.deleteServiceImage(imageUrl);
      setServices((prev) =>
        prev.map((s) =>
          s.serviceID === serviceID
            ? { ...s, imageUrls: s.imageUrls.filter((img) => img !== imageUrl) }
            : s
        )
      );
    } catch (err) {
      handleServiceError(err);
    }
  }, []);

  // --- Context Value ---
  const contextValue = useMemo(
    () => ({
      services,
      totalServices,
      loading,
      fetchServices,
      getServiceById,
      createService,
      updateService,
      deleteService,
      deleteServiceImage,
    }),
    [
      services,
      totalServices,
      loading,
      fetchServices,
      getServiceById,
      createService,
      updateService,
      deleteService,
      deleteServiceImage,
    ]
  );

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};

ServiceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

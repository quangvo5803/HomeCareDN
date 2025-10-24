import { useState, useCallback, useMemo } from 'react';
import getServiceByRole from '../services/getServiceByRole';
import ServiceContext from './ServiceContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Fetch all (có loading overlay)
  const executeFetch = async ({
    PageNumber = 1,
    PageSize = 10,
    SortBy,
    FilterID,
    FilterServiceType,
    FilterPackageOption,
    FilterBuildingType,
    FilterMainStructureType,
    FilterDesignStyle,
    Search,
  } = {}) => {
    try {
      var service = getServiceByRole();
      const data = await service.service.getAllService({
        PageNumber,
        PageSize,
        SortBy,
        FilterID,
        FilterServiceType,
        FilterPackageOption,
        FilterBuildingType,
        FilterMainStructureType,
        FilterDesignStyle,
        Search,
      });
      const itemsWithType = (data.items || []).map((s) => ({
        ...s,
        type: 'service',
      }));
      setServices(itemsWithType);
      setTotalServices(data.totalCount || 0);
      return itemsWithType;
    } catch (err) {
      toast.error(handleApiError(err));
      setServices([]);
      setTotalServices(0);
      return [];
    }
  };

  const fetchServices = useCallback(async (params = {}) => {
    return await withMinLoading(() => executeFetch(params), setLoading);
  }, []);

  // 📌 Get by ID
  const getServiceById = useCallback(async (id) => {
    try {
      var service = getServiceByRole();
      return await service.service.getServiceById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Create (Admin-only)
  const createService = useCallback(async (dto) => {
    try {
      setLoading(true);
      var service = getServiceByRole('Admin');
      const newService = await service.service.createService(dto);
      setServices((prev) => [...prev, newService]);
      setTotalServices((prev) => prev + 1);
      return newService;
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Update (Admin-only)
  const updateService = useCallback(async (dto) => {
    try {
      setLoading(true);
      var service = getServiceByRole();
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
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Delete (Admin-only, no overlay)
  const deleteService = useCallback(async (id) => {
    try {
      var service = getServiceByRole('Admin');
      await service.service.deleteService(id);
      setServices((prev) => prev.filter((s) => s.serviceID !== id));
      setTotalServices((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  // 📌 Delete image (no overlay)
  const deleteServiceImage = useCallback(async (serviceID, imageUrl) => {
    try {
      var service = getServiceByRole();
      await service.image.deleteServiceImage(imageUrl);
      setServices((prev) =>
        prev.map((s) =>
          s.serviceID === serviceID
            ? {
                ...s,
                imageUrls: s.imageUrls.filter((img) => img !== imageUrl),
              }
            : s
        )
      );
    } catch (err) {
      toast.error(handleApiError(err));
    }
  }, []);

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

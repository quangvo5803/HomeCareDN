import { useState, useCallback, useMemo } from 'react';
import { serviceService } from '../services/serviceService';
import { imageService } from '../services/public/imageService';
import ServiceContext from './ServiceContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';

export const ServiceProvider = ({ children }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(false);

  // ==================== FETCH ====================
  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      Search,
      FilterServiceType,
      FilterPackageOption,
      FilterBuildingType,
      FilterMainStructureType,
      FilterDesignStyle,
      ExcludedID,
    } = {}) => {
      try {
        const data = await serviceService.getAll({
          PageNumber,
          PageSize,
          SortBy,
          Search,
          FilterServiceType,
          FilterPackageOption,
          FilterBuildingType,
          FilterMainStructureType,
          FilterDesignStyle,
          ExcludedID,
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
    },
    []
  );

  const fetchServices = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );

  // ==================== GET BY ID ====================
  const getServiceById = useCallback(async (id) => {
    try {
      return await serviceService.getById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // ==================== CREATE ====================
  const createService = useCallback(
    async (dto) => {
      try {
        const newService = await serviceService.create(dto);
        setServices((prev) => [...prev, newService]);
        setTotalServices((prev) => prev + 1);
        toast.success(t('SUCCESS.SERVICE_ADD'));
        return newService;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t]
  );

  // ==================== UPDATE ====================
  const updateService = useCallback(
    async (dto) => {
      try {
        const updated = await serviceService.update(dto);
        setServices((prev) =>
          prev.map((s) =>
            s.serviceID === updated.serviceID
              ? {
                  ...s,
                  ...updated,
                  imageUrls: updated.imageUrls ?? s.imageUrls,
                }
              : s
          )
        );
        toast.success(t('SUCCESS.SERVICE_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [t]
  );

  // ==================== DELETE ====================
  const deleteService = useCallback(async (id) => {
    try {
      await serviceService.delete(id);
      setServices((prev) => prev.filter((s) => s.serviceID !== id));
      setTotalServices((prev) => prev - 1);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  }, []);

  // ==================== DELETE IMAGE ====================
  const deleteServiceImage = useCallback(async (serviceID, imageUrl) => {
    try {
      await imageService.delete(imageUrl);
      setServices((prev) =>
        prev.map((s) =>
          s.serviceID === serviceID
            ? { ...s, imageUrls: s.imageUrls.filter((img) => img !== imageUrl) }
            : s
        )
      );
    } catch (err) {
      toast.error(handleApiError(err));
    }
  }, []);

  // ==================== CONTEXT VALUE ====================
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

import { useState, useCallback, useMemo } from 'react';
import { serviceService } from '../services/serviceService';
import { useAuth } from '../hook/useAuth';
import ServiceContext from './ServiceContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const ServiceProvider = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(false);
  // 📌 Public: fetch all
  const fetchServices = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, FilterID } = {}) => {
      try {
        setLoading(true);
        const data = await serviceService.getAllService({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
        });
        const itemsWithType = (data.items || []).map((m) => ({
          ...m,
          type: 'service',
        }));
        setServices(itemsWithType || []);
        setTotalServices(data.totalCount || 0);
        return itemsWithType;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 📌 Public: get by id
  const getServiceById = useCallback(
    async (id) => {
      const local = services.find((s) => s.serviceID === id);
      if (local) return local;
      try {
        return await serviceService.getServiceById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [services]
  );

  // 📌 Admin-only: create
  const createService = useCallback(
    async (serviceData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newService = await serviceService.createService(serviceData);
        setServices((prev) => [...prev, newService]);
        setTotalServices((prev) => prev + 1);
        return newService;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // 📌 Admin-only: update
  const updateService = useCallback(
    async (serviceData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await serviceService.updateService(serviceData);
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

  // 📌 Admin-only: delete
  const deleteService = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await serviceService.deleteService(id);
        setServices((prev) => prev.filter((s) => s.serviceID !== id));
        setTotalServices((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );
  const deleteServiceImage = useCallback(async (serviceID, imageUrl) => {
    try {
      await serviceService.deleteServiceImage(imageUrl);

      // update materials
      const updateImages = (s) => {
        if (s.serviceID !== serviceID) return s;
        return {
          ...s,
          imageUrls: s.imageUrls.filter((imgUrl) => imgUrl !== imageUrl),
        };
      };

      setServices((prev) => prev.map(updateImages));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
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

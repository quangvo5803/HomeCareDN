import { useState, useCallback, useMemo } from 'react';
import { publicService } from '../services/publicService';
import { adminService } from '../services/adminService';
import BrandContext from './BrandContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Fetch brands (có min loading)
  const executeFetch = async ({
    PageNumber = 1,
    PageSize = 10,
    SortBy,
    Search,
  } = {}) => {
    try {
      const data = await publicService.brand.getAllBrands({
        PageNumber,
        PageSize,
        SortBy,
        Search,
      });
      setBrands(data.items || []);
      setTotalBrands(data.totalCount || 0);
      return data;
    } catch (err) {
      toast.error(handleApiError(err));
      return { items: [], totalCount: 0 };
    }
  };

  const fetchBrands = useCallback(async (params = {}) => {
    return await withMinLoading(() => executeFetch(params), setLoading);
  }, []);

  // 📌 Fetch all brands (dropdown)
  const executeFetchAllBrands = async () => {
    try {
      const data = await publicService.brand.getAllBrands({
        PageNumber: 1,
        PageSize: 9999,
      });
      return data.items || [];
    } catch (err) {
      toast.error(handleApiError(err));
      return [];
    }
  };

  const fetchAllBrands = useCallback(async () => {
    return await withMinLoading(() => executeFetchAllBrands(), setLoading);
  }, []);

  // 📌 Get by ID
  const getBrandById = useCallback(
    async (id) => {
      try {
        const local = brands.find((b) => b.brandID === id);
        if (local) return local;
        return await publicService.brand.getBrandById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [brands]
  );

  // 📌 Create brand (no min loading)
  const createBrand = useCallback(async (dto) => {
    try {
      setLoading(true);
      const newBrand = await adminService.brand.createBrand(dto);
      setBrands((prev) => [...prev, newBrand]);
      setTotalBrands((prev) => prev + 1);
      return newBrand;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Update brand (no min loading)
  const updateBrand = useCallback(async (dto) => {
    try {
      setLoading(true);
      const updated = await adminService.brand.updateBrand(dto);
      setBrands((prev) =>
        prev.map((b) => (b.brandID === dto.BrandID ? updated : b))
      );
      return updated;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Delete brand (no loading overlay)
  const deleteBrand = useCallback(async (id) => {
    try {
      await adminService.brand.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.brandID !== id));
      setTotalBrands((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      brands,
      totalBrands,
      loading,
      fetchBrands,
      fetchAllBrands,
      getBrandById,
      createBrand,
      updateBrand,
      deleteBrand,
    }),
    [
      brands,
      totalBrands,
      loading,
      fetchBrands,
      fetchAllBrands,
      getBrandById,
      createBrand,
      updateBrand,
      deleteBrand,
    ]
  );

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  );
};

BrandProvider.propTypes = { children: PropTypes.node.isRequired };

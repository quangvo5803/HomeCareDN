import { useState, useCallback, useMemo } from 'react';
import { brandService } from '../services/brandService';
import { useAuth } from '../hook/useAuth';
import BrandContext from './BrandContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
export const BrandProvider = ({ children }) => {
  const { user } = useAuth();
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
      const data = await brandService.getAllBrands({
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
  const fetchBrands = useCallback(
    async (
      params = { PageNumber: 1, PageSize: 10, Search: '', SortBy: '' }
    ) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    []
  );

  // 📌 Fetch all brands (dropdown)
  const executeFetchAllBrands = async () => {
    try {
      const data = await brandService.getAllBrands({
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
        const local = brands.find((c) => c.brandID === id);
        if (local) return local;
        return await brandService.getBrandById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [brands]
  );

  // 📌 Create brand (có min loading)
  const executeCreate = async (dto) => {
    try {
      const newBrand = await brandService.createBrand(dto);
      setBrands((prev) => [...prev, newBrand]);
      setTotalBrands((prev) => prev + 1);
      return newBrand;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  };
  const createBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');

      return await withMinLoading(() => executeCreate(dto), setLoading);
    },
    [user?.role]
  );

  // 📌 Update brand
  const executeUpdateBrand = useCallback(async (dto) => {
    try {
      const updated = await brandService.updateBrand(dto);
      setBrands((prev) =>
        prev.map((b) => (b.brandID === dto.BrandID ? updated : b))
      );
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);
  const updateBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      return await withMinLoading(() => executeUpdateBrand(dto), setLoading);
    },
    [user?.role, executeUpdateBrand]
  );

  // 📌 Delete brand (xóa nhanh, không cần loading overlay)
  const deleteBrand = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await brandService.deleteBrand(id);
        setBrands((prev) => prev.filter((b) => b.brandID !== id));
        setTotalBrands((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

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

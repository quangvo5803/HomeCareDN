import { useState, useCallback, useMemo } from 'react';
import { brandService } from '../services/brandService';
import { useAuth } from '../hook/useAuth';
import BrandContext from './BrandContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const BrandProvider = ({ children }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [loading, setLoading] = useState(false);

  const MIN_LOADING_TIME = 500;

  // 📌 Helper: đảm bảo loading hiển thị tối thiểu
  const withMinLoading = async (asyncFunc) => {
    const startTime = Date.now();
    setLoading(true);
    try {
      return await asyncFunc();
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(MIN_LOADING_TIME - elapsed, 0);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  // 📌 Fetch brands (có min loading)
  const fetchBrands = useCallback(
    async ({ PageNumber = 1, PageSize = 10, SortBy, Search } = {}) => {
      return await withMinLoading(async () => {
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
      });
    },
    []
  );

  // 📌 Fetch all brands (dropdown) - không cần loading
  const fetchAllBrands = useCallback(async () => {
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
  const createBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      return await withMinLoading(async () => {
        try {
          const newBrand = await brandService.createBrand(dto);
          setBrands((prev) => [...prev, newBrand]);
          setTotalBrands((prev) => prev + 1);
          return newBrand;
        } catch (err) {
          toast.error(handleApiError(err));
          throw err;
        }
      });
    },
    [user?.role]
  );

  // 📌 Update brand (có min loading)
  const updateBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      return await withMinLoading(async () => {
        try {
          const updated = await brandService.updateBrand(dto);
          setBrands((prev) =>
            prev.map((b) => (b.brandID === dto.BrandID ? updated : b))
          );
        } catch (err) {
          toast.error(handleApiError(err));
          throw err;
        }
      });
    },
    [user?.role]
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

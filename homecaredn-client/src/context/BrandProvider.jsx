import { useEffect, useState, useCallback, useMemo } from 'react';
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

  // 📌 Public: fetch all brands pagination
  const fetchBrands = useCallback(
    async ({ PageNumber = 1, PageSize = 10 } = {}) => {
      try {
        setLoading(true);
        const data = await brandService.getAllBrands({ PageNumber, PageSize });
        setBrands(data.items || []);
        setTotalBrands(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        return { items: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );
  //Fetch all brands (dùng cho filter dropdown, ko phân trang)
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
  const createBrand = useCallback(
    async (dto, pageParams) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        await brandService.createBrand(dto);
        await fetchBrands(pageParams);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role, fetchBrands]
  );

  const updateBrand = useCallback(
    async (dto, pageParams) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        // Optimistic update
        setBrands((prev) =>
          prev.map((b) => (b.brandID === dto.BrandID ? { ...b, ...dto } : b))
        );
        await brandService.updateBrand(dto);
        await fetchBrands(pageParams);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role, fetchBrands]
  );

  const deleteBrand = useCallback(
    async (id, pageParams) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        // Optimistic update: remove ngay
        setBrands((prev) => prev.filter((b) => b.brandID !== id));
        await brandService.deleteBrand(id);
        await fetchBrands(pageParams);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role, fetchBrands]
  );

  // Load brands
  useEffect(() => {
    fetchBrands({ PageNumber: 1, PageSize: 10 });
  }, [fetchBrands]);

  const contextValue = useMemo(
    () => ({
      brands,
      totalBrands,
      loading,
      fetchBrands,
      fetchAllBrands,
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

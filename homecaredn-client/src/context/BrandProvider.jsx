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
  const getBrandById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const local = brands.find((c) => c.brandID === id);
        if (local) return local;
        return await brandService.getBrandById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [brands]
  );
  const createBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newBrand = await brandService.createBrand(dto);
        setBrands((prev) => [...prev, newBrand]);
        // Tăng tổng số brand
        setTotalBrands((prev) => prev + 1);
        return newBrand;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  const updateBrand = useCallback(
    async (dto) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await brandService.updateBrand(dto);
        // Optimistic update
        setBrands((prev) =>
          prev.map((b) => (b.brandID === dto.BrandID ? updated : b))
        );
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  const deleteBrand = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await brandService.deleteBrand(id);
        // Xoá khỏi local
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

import { useState, useCallback, useMemo } from 'react';
import { brandService } from '../services/brandService';
import BrandContext from './BrandContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';

export const BrandProvider = ({ children }) => {
  const { t } = useTranslation();

  const [brands, setBrands] = useState([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [loading, setLoading] = useState(false); // chỉ dùng cho fetch

  // 📌 Fetch brands (có min loading để UX mượt)
  const executeFetch = async ({
    PageNumber = 1,
    PageSize = 10,
    SortBy,
    Search,
  } = {}) => {
    try {
      const data = await brandService.getAll({
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
      const data = await brandService.getAll({ PageNumber: 1, PageSize: 9999 });
      return data.items || [];
    } catch (err) {
      toast.error(handleApiError(err));
      return [];
    }
  };

  const fetchAllBrands = useCallback(async () => {
    return await withMinLoading(() => executeFetchAllBrands(), setLoading);
  }, []);

  // 📌 Get brand by ID
  const getBrandById = useCallback(
    async (id) => {
      try {
        const local = brands.find((b) => b.brandID === id);
        if (local) return local;
        return await brandService.getById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [brands]
  );

  // 📌 Create brand (component sẽ tự quản lý loading nếu cần)
  const createBrand = useCallback(
    async (dto) => {
      try {
        const newBrand = await brandService.create(dto);
        setBrands((prev) => [...prev, newBrand]);
        setTotalBrands((prev) => prev + 1);
        toast.success(t('SUCCESS.BRAND_ADD'));
        return newBrand;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t]
  );

  // 📌 Update brand
  const updateBrand = useCallback(
    async (dto) => {
      try {
        const updated = await brandService.update(dto);
        setBrands((prev) =>
          prev.map((b) => (b.brandID === dto.BrandID ? updated : b))
        );
        toast.success(t('SUCCESS.BRAND_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t]
  );

  // 📌 Delete brand
  const deleteBrand = useCallback(async (id) => {
    try {
      await brandService.delete(id);
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
      loading, // chỉ dùng cho fetch
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

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
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all brands
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Public: get brand by id
  const getBrandById = useCallback(async (id) => {
    try {
      return await brandService.getBrandById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Admin-only: create
  const createBrand = useCallback(
    async (brandData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newBrand = await brandService.createBrand(brandData);
        setBrands((prev) => [...prev, newBrand]);
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

  // 📌 Admin-only: update
  const updateBrand = useCallback(
    async (brandData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await brandService.updateBrand(brandData);
        setBrands((prev) =>
          prev.map((b) =>
            b.brandID === updated.brandID
              ? {
                  ...b,
                  ...updated,
                  brandLogo: updated.brandLogo ?? b.brandLogo,
                }
              : b
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
  const deleteBrand = useCallback(
    async (id) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await brandService.deleteBrand(id);
        setBrands((prev) => prev.filter((b) => b.brandID !== id));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  // 📌 Load brands khi user login, reset khi logout
  useEffect(() => {
    if (user) fetchBrands();
    else setBrands([]);
  }, [user, fetchBrands]);

  const contextValue = useMemo(
    () => ({
      brands,
      loading,
      fetchBrands,
      getBrandById,
      createBrand,
      updateBrand,
      deleteBrand,
    }),
    [
      brands,
      loading,
      fetchBrands,
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

BrandProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

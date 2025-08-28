import { useEffect, useState, useCallback } from 'react';
import { brandService } from '../services/brandService';
import { useAuth } from '../hook/useAuth';
import BrandContext from './BrandContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';

export const BrandProvider = ({ children }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all brands (cho mọi role)
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
  const getBrandById = async (id) => {
    try {
      return await brandService.getBrandById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  };

  // 📌 Admin-only: create
  const createBrand = async (brandData) => {
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
  };

  // 📌 Admin-only: update
  const updateBrand = async (brandData) => {
    if (user?.role !== 'Admin') throw new Error('Unauthorized');
    try {
      setLoading(true);
      const updated = await brandService.updateBrand(brandData);
      setBrands((prev) =>
        prev.map((b) => (b.brandID === updated.brandID ? updated : b))
      );
      return updated;
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📌 Admin-only: delete
  const deleteBrand = async (id) => {
    if (user?.role !== 'Admin') throw new Error('Unauthorized');
    try {
      await brandService.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.brandID !== id));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  };

  // 📌 Load brands khi user login, reset khi logout
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        loading,
        fetchBrands,
        getBrandById,
        createBrand,
        updateBrand,
        deleteBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

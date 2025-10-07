import { useState, useCallback, useMemo } from 'react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hook/useAuth';
import CategoryContext from './CategoryContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all categories pagination
  const fetchCategories = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID, FilterBool, Search } = {}) => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories({
          PageNumber,
          PageSize,
          FilterID,
          FilterBool,
          Search,
        });
        setCategories(data.items || []);
        setTotalCategories(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const fetchAllCategories = useCallback(
    async ({ FilterID, FilterBool } = {}) => {
      try {
        const data = await categoryService.getAllCategories({
          PageNumber: 1,
          PageSize: 9999,
          FilterID,
          FilterBool,
        });
        return data.items || [];
      } catch (err) {
        toast.error(handleApiError(err));
        return [];
      }
    },
    []
  );
  // 📌 Public: get category by id
  const getCategoryById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const local = categories.find((c) => c.categoryID === id);
        if (local) return local;
        return await categoryService.getCategoryById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [categories]
  );

  // 📌 Admin-only: create
  const createCategory = useCallback(
    async (categoryData) => {
      if (user?.role !== 'Admin' && user?.role !== 'Distributor')
        throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newCategory = await categoryService.createCategory(categoryData);
        setCategories((prev) => [...prev, newCategory]);
        // Tăng tổng số category
        setTotalCategories((prev) => prev + 1);
        return newCategory;
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
  const updateCategory = useCallback(
    async (categoryData) => {
      if (user?.role !== 'Admin' && user?.role !== 'Distributor')
        throw new Error('Unauthorized');
      try {
        setLoading(true);
        const updated = await categoryService.updateCategory(categoryData);
        setCategories((prev) =>
          prev.map((c) => (c.categoryID === updated.categoryID ? updated : c))
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
  const deleteCategory = useCallback(
    async (id) => {
      if (user?.role !== 'Admin' && user?.role !== 'Distributor')
        throw new Error('Unauthorized');
      try {
        await categoryService.deleteCategory(id);
        // Xoá khỏi local
        setCategories((prev) => prev.filter((c) => c.categoryID !== id));
        setTotalCategories((prev) => prev - 1);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  const contextValue = useMemo(
    () => ({
      categories,
      totalCategories,
      loading,
      fetchCategories,
      fetchAllCategories,
      getCategoryById,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      categories,
      totalCategories,
      loading,
      fetchCategories,
      fetchAllCategories,
      getCategoryById,
      createCategory,
      updateCategory,
      deleteCategory,
    ]
  );

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

CategoryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

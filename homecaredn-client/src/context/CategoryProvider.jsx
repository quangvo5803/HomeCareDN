import { useEffect, useState, useCallback, useMemo } from 'react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hook/useAuth';
import CategoryContext from './CategoryContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 📌 Public: get category by id
  const getCategoryById = useCallback(async (id) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  }, []);

  // 📌 Admin-only: create
  const createCategory = useCallback(
    async (categoryData) => {
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        setLoading(true);
        const newCategory = await categoryService.createCategory(categoryData);
        setCategories((prev) => [...prev, newCategory]);
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
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
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
      if (user?.role !== 'Admin') throw new Error('Unauthorized');
      try {
        await categoryService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.categoryID !== id));
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [user?.role]
  );

  // 📌 Load categories khi user login, reset khi logout
  useEffect(() => {
    if (user) fetchCategories();
    else setCategories([]);
  }, [user, fetchCategories]);

  const contextValue = useMemo(
    () => ({
      categories,
      loading,
      fetchCategories,
      getCategoryById,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      categories,
      loading,
      fetchCategories,
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

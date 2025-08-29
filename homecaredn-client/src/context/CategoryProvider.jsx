import { useEffect, useState, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hook/useAuth';
import CategoryContext from './CategoryContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all brands (cho mọi role)
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

  // 📌 Public: get brand by id
  const getCategoryById = async (id) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (err) {
      toast.error(handleApiError(err));
      return null;
    }
  };

  // 📌 Admin-only: create
  const createCategory = async (categoryData) => {
    if (user?.role !== 'Admin') throw new Error('Unauthorized');
    try {
      setLoading(true);
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      fetchCategories();
      setLoading(false);
    }
  };

  // 📌 Admin-only: update
  const updateCategory = async (categoryData) => {
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
      fetchCategories();
      setLoading(false);
    }
  };

  // 📌 Admin-only: delete
  const deleteCategory = async (id) => {
    if (user?.role !== 'Admin') throw new Error('Unauthorized');
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((b) => b.categoryID !== id));
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    } finally {
      fetchCategories();
    }
  };

  // 📌 Load brands khi user login, reset khi logout
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        fetchCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

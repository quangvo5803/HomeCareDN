import { useState, useCallback, useMemo } from 'react';
import { categoryService } from '../services/categoryService';
import CategoryContext from './CategoryContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';

export const CategoryProvider = ({ children }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Fetch paginated categories
  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      FilterID,
      FilterBool,
      SortBy,
      Search,
    } = {}) => {
      try {
        const data = await categoryService.getAll({
          PageNumber,
          PageSize,
          FilterID,
          FilterBool,
          SortBy,
          Search,
        });
        setCategories(data.items || []);
        setTotalCategories(data.totalCount || 0);
        return data;
      } catch (err) {
        toast.error(handleApiError(err));
        setCategories([]);
        setTotalCategories(0);
        return { items: [], totalCount: 0 };
      }
    },
    []
  );

  const fetchCategories = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );

  // 📌 Fetch all categories (dropdown)
  const executeFetchAll = useCallback(async ({ FilterID, FilterBool } = {}) => {
    try {
      const data = await categoryService.getAll({
        PageNumber: 1,
        PageSize: 9999,
        SortBy: 'categoryname',
        FilterID,
        FilterBool,
      });
      return data.items || [];
    } catch (err) {
      toast.error(handleApiError(err));
      return [];
    }
  }, []);

  const fetchAllCategories = useCallback(
    async (filters = {}) => {
      return await withMinLoading(() => executeFetchAll(filters), setLoading);
    },
    [executeFetchAll]
  );

  // 📌 Get category by id
  const getCategoryById = useCallback(
    async (id) => {
      return await withMinLoading(async () => {
        try {
          const local = categories.find((c) => c.categoryID === id);
          if (local) return local;

          return await categoryService.getById(id);
        } catch (err) {
          toast.error(handleApiError(err));
          return null;
        }
      }, setLoading);
    },
    [categories]
  );

  // 📌 Admin-only CUD (component tự handle loading)
  const createCategory = useCallback(
    async (categoryData) => {
      try {
        const newCategory = await categoryService.create(categoryData);
        setCategories((prev) => [...prev, newCategory]);
        setTotalCategories((prev) => prev + 1);
        toast.success(t('SUCCESS.CATEGORY_ADD'));
        return newCategory;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t]
  );

  const updateCategory = useCallback(
    async (categoryData) => {
      try {
        const updated = await categoryService.update(categoryData);
        setCategories((prev) =>
          prev.map((c) => (c.categoryID === updated.categoryID ? updated : c))
        );
        toast.success(t('SUCCESS.CATEGORY_UPDATE'));
        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      }
    },
    [t]
  );

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.categoryID !== id));
      setTotalCategories((prev) => prev - 1);
    } catch (err) {
      toast.error(handleApiError(err));
      throw err;
    }
  }, []);

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

CategoryProvider.propTypes = { children: PropTypes.node.isRequired };

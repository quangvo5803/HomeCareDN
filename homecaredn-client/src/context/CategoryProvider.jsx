import { useState, useCallback, useMemo } from 'react';
import getServiceByRole from '../services/getServiceByRole';
import { useAuth } from '../hook/useAuth';
import CategoryContext from './CategoryContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { useTranslation } from 'react-i18next';

export const CategoryProvider = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 Public: fetch all categories pagination
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
        const service = getServiceByRole();
        const data = await service.category.getAllCategories({
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

  const executeFetchAllCategories = useCallback(
    async ({ FilterID, FilterBool } = {}) => {
      try {
        const service = getServiceByRole();
        const data = await service.category.getAllCategories({
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

  const fetchAllCategories = useCallback(
    async (filters = {}) => {
      return await withMinLoading(
        () => executeFetchAllCategories(filters),
        setLoading
      );
    },
    [executeFetchAllCategories]
  );

  // 📌 Public: get category by id
  const getCategoryById = useCallback(
    async (id) => {
      try {
        const local = categories.find((c) => c.categoryID === id);
        if (local) return local;
        const service = getServiceByRole();
        return await service.category.getCategoryById(id);
      } catch (err) {
        toast.error(handleApiError(err));
        return null;
      }
    },
    [categories]
  );

  // 📌 Admin-only: create
  const createCategory = useCallback(
    async (categoryData) => {
      try {
        setLoading(true);
        const service = getServiceByRole(user.role);
        const newCategory = service.category.createCategory(categoryData);
        setCategories((prev) => [...prev, newCategory]);
        // Tăng tổng số category
        setTotalCategories((prev) => prev + 1);
        toast.success(t('SUCCESS.CATEGORY_ADD'));
        return newCategory;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role, t]
  );

  // 📌 Admin-only: update
  const updateCategory = useCallback(
    async (categoryData) => {
      try {
        setLoading(true);
        const service = getServiceByRole(user.role);
        const updated = await service.category.updateCategory(categoryData);
        setCategories((prev) =>
          prev.map((c) => (c.categoryID === updated.categoryID ? updated : c))
        );
        toast.success(t('SUCCESS.CATEGORY_UPDATE'));

        return updated;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.role, t]
  );

  // 📌 Admin-only: delete
  const deleteCategory = useCallback(
    async (id) => {
      try {
        const service = getServiceByRole(user.role);
        await service.category.deleteCategory(id);
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

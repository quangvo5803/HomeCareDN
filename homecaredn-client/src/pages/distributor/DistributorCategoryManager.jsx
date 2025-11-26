import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useCategory } from '../../hook/useCategory';
import { Pagination } from 'antd';
import CategoryModal from '../../components/modal/CategoryModal';
import { useAuth } from '../../hook/useAuth';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useDebounce } from 'use-debounce';

export default function DistributorCategoryManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const pageSize = 10;

  const {
    categories,
    totalCategories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryID, setEditingCategoryID] = useState(null);

  useEffect(() => {
    fetchCategories({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortBy,
      Search: debouncedSearch || '',
    });
  }, [fetchCategories, currentPage, pageSize, sortBy, debouncedSearch]);

  // Delete Category
  const handleDelete = async (categoryID) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteCategoryModal.title',
      textKey: 'ModalPopup.DeleteCategoryModal.text',
      onConfirm: async () => {
        await deleteCategory(categoryID);

        const lastPage = Math.ceil((totalCategories - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          await fetchCategories({
            PageNumber: currentPage,
            PageSize: pageSize,
          });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };
  // Save Category (Create / Update)
  const handleSave = async (categoryData) => {
    setSubmitting(true);
    try {
      if (categoryData.CategoryID) {
        await updateCategory(categoryData);
      } else {
        await createCategory(categoryData);
        const lastPage = Math.ceil((totalCategories + 1) / pageSize);
        setCurrentPage(lastPage);
      }

      setIsModalOpen(false);
      setEditingCategoryID(null);
    } catch (err) {
      console.error(err);
      return;
    } finally {
      setSubmitting(false);
    }
  };
  // Search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  // Determine action permissions
  const getActionPermissions = (category) => {
    const isOwner = user?.id === category.userID;
    const isInactive = !category.isActive;

    return {
      canEdit: isOwner && isInactive,
      canDelete: isOwner,
    };
  };

  if (submitting || uploadProgress || loading)
    return <Loading progress={uploadProgress} />;

  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="mr-2 fa-solid fa-tags"></i>
            {t('distributorCategoryManager.title')}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {totalCategories || 0}{' '}
              {t('distributorCategoryManager.categories')}
            </span>
          </div>
        </div>
        {/* Right Side: Actions (Filter - Search - Add) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/*  Filter Select */}
          <select
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">{t('common.sortDefault')}</option>
            <option
              value={i18n.language === 'vi' ? 'categoryname' : 'categorynameen'}
            >
              {t('common.sortName')}
            </option>
            <option
              value={
                i18n.language === 'vi'
                  ? 'categoryname_desc'
                  : 'categorynameen_desc'
              }
            >
              {t('common.sortNameDesc')}
            </option>
            <option value="materialcount">
              {t('common.sortMaterialCount')}
            </option>
            <option value="materialcount_desc">
              {t('common.sortMaterialCountDesc')}
            </option>
          </select>

          {/* Search Input */}
          <div className="relative group w-full sm:w-auto">
            <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t('common.search')}
              className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
            />
          </div>

          {/* Add Button */}
          <button
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600 shadow-sm flex items-center justify-center"
            onClick={() => {
              setEditingCategoryID(null);
              setIsModalOpen(true);
            }}
          >
            <i className="mr-2 fa-solid fa-plus"></i>
            {t('BUTTON.AddNewCategory')}
          </button>
        </div>
      </div>

      {/*  render modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategoryID(null);
        }}
        onSave={handleSave}
        categoryID={editingCategoryID}
        setUploadProgress={setUploadProgress}
        setSubmitting={setSubmitting}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {/* NOSONAR */}
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorCategoryManager.no')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase">
                {t('distributorCategoryManager.categoryName')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorCategoryManager.numberOfMaterials')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorCategoryManager.status')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorCategoryManager.action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories && categories.length > 0 ? (
              categories.map((category, index) => {
                const { canEdit, canDelete } = getActionPermissions(category);
                return (
                  <tr
                    key={category.categoryID}
                    className={`hover:bg-sky-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    {/* STT */}
                    <td className="px-4 py-4 text-center align-middle">
                      <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                    </td>

                    {/* Category Name + Avatar */}
                    <td className="flex items-center gap-3 px-6 py-4 text-left">
                      {category.categoryLogo ? (
                        <img
                          src={category.categoryLogo}
                          alt={category.categoryName}
                          className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                        />
                      ) : (
                        <img
                          src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                          alt="No image"
                          className="object-cover border border-gray-200 rounded-lg w-13 h-13"
                        />
                      )}
                      <span className="font-medium text-gray-900">
                        {i18n.language === 'vi'
                          ? category.categoryName
                          : category.categoryNameEN || category.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        {category.materials?.length || 0}{' '}
                        {t('distributorCategoryManager.materials')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      {category.isActive ? (
                        <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          {t('BUTTON.Activate')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                          {t('BUTTON.Deactivate')}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      {category.materials?.length === 0 && (
                        <div className="flex justify-center gap-2">
                          {canEdit && (
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setEditingCategoryID(category.categoryID);
                                setIsModalOpen(true);
                              }}
                            >
                              <i className="fa-solid fa-pen"></i>{' '}
                              {t('BUTTON.Edit')}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                              onClick={() => handleDelete(category.categoryID)}
                            >
                              <i className="fa-solid fa-trash"></i>{' '}
                              {t('BUTTON.Delete')}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      {t('distributorCategoryManager.noCategory')}
                    </h3>
                    <p className="mb-4 text-gray-500">
                      {t('distributorCategoryManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 text-white rounded-lg bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="mr-3 fa-solid fa-plus"></i>
                      {t('BUTTON.AddNewCategory')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {totalCategories > 0 && (
          <div className="flex justify-center py-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCategories}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useCategory } from '../../hook/useCategory';
import { Pagination } from 'antd';
import CategoryModal from '../../components/modal/CategoryModal';
import { useAuth } from '../../hook/useAuth';
import { showDeleteModal } from '../../components/modal/DeleteModal';

export default function DistributorCategoryManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);

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
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories({
      PageNumber: currentPage,
      PageSize: pageSize,
      FilterID: user?.id,
    });
  }, [fetchCategories, currentPage, pageSize, user]);

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
            FilterID: user?.id,
          });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };
  // Save Category (Create / Update)
  const handleSave = async (categoryData) => {
    if (categoryData.CategoryID) {
      await updateCategory(categoryData);
      toast.success(t('SUCCESS.CATEGORY_UPDATE'));
    } else {
      await createCategory(categoryData);
      toast.success(t('SUCCESS.CATEGORY_ADD'));
      const lastPage = Math.ceil((totalCategories + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;

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
        <button
          className="px-4 py-2 text-sm text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <i className="mr-2 fa-solid fa-plus"></i>
          {t('BUTTON.AddNewCategory')}
        </button>
      </div>

      {/*  render modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        category={editingCategory}
        setUploadProgress={setUploadProgress}
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
              categories.map((category, index) => (
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
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-pen"></i> {t('BUTTON.Edit')}
                        </button>

                        <button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                          onClick={() => handleDelete(category.categoryID)}
                        >
                          <i className="fa-solid fa-trash"></i>{' '}
                          {t('BUTTON.Delete')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
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
        {totalCategories.length > 0 && (
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

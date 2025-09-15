import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { handleApiError } from '../../utils/handleApiError';
import Loading from '../../components/Loading';
import Swal from 'sweetalert2';
import { useCategory } from '../../hook/useCategory';
import { Pagination } from 'antd';
import CategoryModal from '../../components/modal/CategoryModal';
import { useAuth } from '../../hook/useAuth';

export default function DistributorCategoryManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
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

  // Delete Material
  const handleDelete = async (categoryID) => {
    Swal.fire({
      title: t('ModalPopup.DeleteMaterialModal.title'),
      text: t('ModalPopup.DeleteMaterialModal.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('BUTTON.Delete'),
      cancelButtonText: t('BUTTON.Cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: t('ModalPopup.DeletingLoadingModal.title'),
            text: t('ModalPopup.DeletingLoadingModal.text'),
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          await deleteCategory(categoryID);
          const lastPage = Math.ceil((totalCategories - 1) / pageSize);
          if (currentPage > lastPage) {
            setCurrentPage(lastPage || 1);
          } else {
            fetchCategories({
              PageNumber: currentPage,
              PageSize: pageSize,
              UserID: user?.userID,
            });
          }
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
        } catch (err) {
          Swal.close();
          if (err.handled) return;
          toast.error(handleApiError(err));
        }
      }
    });
  };

  // Save Material (Create / Update)
  const handleSave = async (categoryData) => {
    console.log(user.role);
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
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg text-gray-800">
          <i className="fa-solid fa-tags mr-2"></i>
          {t('distributorCategoryManager.title')}
        </h3>
        <button
          className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <i className="fa-solid fa-plus mr-2"></i>
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
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorCategoryManager.no')}
              </th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-xs">
                {t('distributorCategoryManager.categoryName')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorCategoryManager.numberOfMaterials')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorCategoryManager.status')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
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
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {(currentPage - 1) * pageSize + index + 1}
                    </span>
                  </td>

                  {/* Category Name + Avatar */}
                  <td className="px-6 py-4 text-left flex items-center gap-3">
                    {category.categoryLogo ? (
                      <img
                        src={category.categoryLogo}
                        alt={category.categoryName}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center rounded-lg">
                        <span className="text-white font-bold text-sm">
                          {category.categoryName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {i18n.language === 'vi'
                        ? category.categoryName
                        : category.categoryNameEN || category.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {category.materials?.length || 0}{' '}
                      {t('distributorCategoryManager.materials')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    {category.isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('BUTTON.Activate')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('BUTTON.Deactivate')}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    {!category.isActive && (
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
                          onClick={() => handleDelete(category.materialID)}
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
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {t('distributorCategoryManager.noCategory')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('distributorCategoryManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="fa-solid fa-plus mr-3"></i>
                      {t('BUTTON.AddNewCategory')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
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
      </div>
    </div>
  );
}

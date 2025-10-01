import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useMaterial } from '../../hook/useMaterial';
import { Pagination } from 'antd';
import MaterialModal from '../../components/modal/MaterialModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useBrand } from '../../hook/useBrand';
import { useCategory } from '../../hook/useCategory';
import { handleApiError } from '../../utils/handleApiError';
import { useAuth } from '../../hook/useAuth';
import { useDebounce } from 'use-debounce';

export default function AdminMaterialManager() {
  const { t, i18n } = useTranslation();
  const { user: authUser } = useAuth();
  const adminId = authUser?.id?.toString();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const {
    materials,
    totalMaterials,
    loading,
    fetchMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterial();

  useEffect(() => {
    (async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          fetchAllBrands(),
          fetchAllCategories({ FilterBool: true }),
        ]);
        setBrands(brandList);
        setCategories(categoryList);
      } catch (err) {
        toast.error(handleApiError(err));
      }
    })();
  }, [fetchAllBrands, fetchAllCategories]);

  useEffect(() => {
    fetchMaterials({
      PageNumber: currentPage,
      PageSize: pageSize,
      Search: debouncedSearch || '',
    });
  }, [currentPage, pageSize, debouncedSearch, fetchMaterials]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const getCreatorId = (m) => (m?.userId ?? m?.userID)?.toString();

  const getCreatorName = (m) => m?.userFullName || m?.userName || '-';

  const isOwnedByAdmin = (m) => {
    const creatorId = getCreatorId(m);
    return creatorId && adminId && creatorId === adminId;
  };

  // Delete
  const handleDelete = async (materialId) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteMaterialModal.title',
      textKey: 'ModalPopup.DeleteMaterialModal.text',
      onConfirm: async () => {
        await deleteMaterial(materialId);

        const lastPage = Math.ceil((totalMaterials - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          await fetchMaterials({ PageNumber: currentPage, PageSize: pageSize });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };

  // View (read-only)
  const handleView = async (m) => {
    const res = await getMaterialById(m.materialID);
    setEditingMaterial(res || m);
    setModalReadOnly(true);
    setIsModalOpen(true);
  };

  // Edit (owner only)
  const handleEdit = async (m) => {
    const res = await getMaterialById(m.materialID);
    setEditingMaterial(res || m);
    setModalReadOnly(false);
    setIsModalOpen(true);
  };

  // Save (Create / Update)
  const handleSave = async (materialData) => {
    if (modalReadOnly) {
      toast.info(t('common.viewOnly', { defaultValue: 'View only' }));
      setIsModalOpen(false);
      setEditingMaterial(null);
      return;
    }

    if (materialData.MaterialID) {
      await updateMaterial(materialData);
      toast.success(t('SUCCESS.MATERIAL_UPDATE'));
      await fetchMaterials({ PageNumber: currentPage, PageSize: pageSize });
    } else {
      await createMaterial(materialData);
      toast.success(t('SUCCESS.MATERIAL_ADD'));

      const newTotal = (totalMaterials ?? 0) + 1;
      const newLastPage = Math.ceil(newTotal / pageSize);

      if (newLastPage !== currentPage) {
        setCurrentPage(newLastPage);
      } else {
        await fetchMaterials({ PageNumber: currentPage, PageSize: pageSize });
      }
    }

    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  if (loading) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-tags"></i>
            {t('adminMaterialManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminMaterialManager.subtitle')}</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              {/* Number of services */}
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {totalMaterials || 0} {t('adminMaterialManager.material')}
              </span>
            </div>
            {/* Input search */}
            <div className="flex-1 max-w-lg w-full">
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={t('common.search')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <button
              className="px-4 py-2 text-sm text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                if (brands.length === 0 || categories.length === 0) {
                  toast.error(t('adminMaterialManager.noBrandAndService'));
                  return;
                }
                setEditingMaterial(null);
                setModalReadOnly(false);
                setIsModalOpen(true);
              }}
            >
              <i className="mr-2 fa-solid fa-plus"></i>
              {t('BUTTON.AddNewMaterial')}
            </button>
          </div>

          {/* Modal */}
          <MaterialModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingMaterial(null);
              setModalReadOnly(false);
            }}
            onSave={handleSave}
            material={editingMaterial}
            brands={brands}
            categories={categories}
            setUploadProgress={setUploadProgress}
            readOnly={modalReadOnly}
          />

          {/* Table */}
          <div className="w-full">
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('distributorMaterialManager.no')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase">
                      {t('distributorMaterialManager.materialName')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('distributorMaterialManager.brand')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('distributorMaterialManager.category')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('distributorMaterialManager.unit')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('adminMaterialManager.createdBy', {
                        defaultValue: 'Created By',
                      })}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                      {t('distributorMaterialManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials && materials.length > 0 ? (
                    materials.map((m, index) => {
                      const owned = isOwnedByAdmin(m);
                      const creatorName = getCreatorName(m);
                      return (
                        <tr
                          key={m.materialID}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          {/* STT */}
                          <td className="px-4 py-4 text-center align-middle">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                              {(currentPage - 1) * pageSize + index + 1}
                            </span>
                          </td>

                          {/* Name + Image */}
                          <td className="px-6 py-4 text-left align-middle">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-10 h-10 mr-3 overflow-hidden rounded-lg border border-gray-200">
                                {m.imageUrls?.length > 0 && m.imageUrls[0] ? (
                                  <img
                                    src={m.imageUrls[0]}
                                    alt={m.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <img
                                    src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                                    alt="No image"
                                    className="object-cover w-10 h-10"
                                  />
                                )}
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {i18n.language === 'vi'
                                  ? m.name
                                  : m.nameEN || m.name}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center align-middle">
                            {i18n.language === 'vi'
                              ? m.brandName
                              : m.brandNameEN || m.brandName}
                          </td>

                          <td className="px-6 py-4 text-center align-middle">
                            {i18n.language === 'vi'
                              ? m.categoryName
                              : m.categoryNameEN || m.categoryName}
                          </td>

                          <td className="px-6 py-4 text-center align-middle">
                            {i18n.language === 'vi'
                              ? m.unit
                              : m.unitEN || m.unit}
                          </td>

                          <td className="px-6 py-4 text-center align-middle">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-md ">
                              {owned
                                ? t('common.you', { defaultValue: 'You' })
                                : creatorName}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-center align-middle">
                            <div className="flex justify-center space-x-2">
                              {owned ? (
                                <>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    onClick={() => handleEdit(m)}
                                  >
                                    {t('BUTTON.Edit')}
                                  </button>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                    onClick={() => handleDelete(m.materialID)}
                                  >
                                    {t('BUTTON.Delete')}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    onClick={() => handleView(m)}
                                  >
                                    {t('BUTTON.View')}
                                  </button>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                    onClick={() => handleDelete(m.materialID)}
                                  >
                                    {t('BUTTON.Delete')}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center mt-5 mb-5">
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
                            {t('adminMaterialManager.noMaterial')}
                          </h3>
                          <p className="mb-4 text-gray-500">
                            {t('adminMaterialManager.letStart')}
                          </p>
                          <button
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            onClick={() => {
                              if (
                                brands.length === 0 ||
                                categories.length === 0
                              ) {
                                toast.error(
                                  t('adminMaterialManager.noBrandAndService')
                                );
                                return;
                              }
                              setEditingMaterial(null);
                              setModalReadOnly(false);
                              setIsModalOpen(true);
                            }}
                          >
                            <i className="mr-3 fa-solid fa-plus"></i>
                            {t('BUTTON.AddNewMaterial')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalMaterials > 0 && (
              <div className="flex justify-center py-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalMaterials}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

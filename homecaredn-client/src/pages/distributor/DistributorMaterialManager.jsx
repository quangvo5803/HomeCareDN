import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useMaterial } from '../../hook/useMaterial';
import { Pagination } from 'antd';
import MaterialModal from '../../components/modal/MaterialModal';
import { useAuth } from '../../hook/useAuth';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useBrand } from '../../hook/useBrand';
import { useCategory } from '../../hook/useCategory';
import { handleApiError } from '../../utils/handleApiError';
import { useDebounce } from 'use-debounce';

export default function DistributorMaterialManager() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const {
    materials,
    totalMaterials,
    loading,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterial();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialID, setEditingMaterialID] = useState(null);
  useEffect(() => {
    (async () => {
      setLoadingInitialData(true);
      try {
        const [brandList, categoryList] = await Promise.all([
          fetchAllBrands(),
          fetchAllCategories({ FilterBool: true }),
        ]);
        setBrands(brandList);
        setCategories(categoryList);
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setLoadingInitialData(false);
      }
    })();
  }, [fetchAllBrands, fetchAllCategories]);

  useEffect(() => {
    fetchMaterials({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortBy,
      Search: debouncedSearch || '',
    });
  }, [fetchMaterials, currentPage, pageSize, sortBy, debouncedSearch]);

  // Delete Material
  const handleDelete = async (materialID) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteMaterialModal.title',
      textKey: 'ModalPopup.DeleteMaterialModal.text',
      onConfirm: async () => {
        await deleteMaterial(materialID);

        const lastPage = Math.ceil((totalMaterials - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          await fetchMaterials({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortBy,
            Search: debouncedSearch || '',
          });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };

  // Save Material (Create / Update)
  const handleSave = async (materialData) => {
    setSubmitting(true);
    try {
      if (materialData.MaterialID) {
        await updateMaterial(materialData);
      } else {
        await createMaterial(materialData);
        const lastPage = Math.ceil((totalMaterials + 1) / pageSize);
        setCurrentPage(lastPage);
      }
      setIsModalOpen(false);
      setEditingMaterialID(null);
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
  const getActionPermissions = (material) => {
    const creatorID = material.userID || material.userId;
    const isOwner = user?.id === creatorID;
    const isInactive = !material.isActive;

    return {
      canEdit: isOwner && isInactive,
      canDelete: isOwner,
    };
  };

  if (submitting || uploadProgress || loading)
    return <Loading progress={uploadProgress} />;
  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-gray-100 bg-white">
        <div className="flex flex-col space-y-1">
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <i className="mr-2 fa-solid fa-box"></i>
            {t('distributorMaterialManager.title')}
          </h3>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {totalMaterials || 0} {t('distributorMaterialManager.material')}
            </span>
          </div>
        </div>

        {/* Controls Container - Stack on mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          {/* Filter Select */}
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer w-full md:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">{t('common.sortDefault')}</option>
            <option
              value={i18n.language === 'vi' ? 'materialname' : 'materialnameen'}
            >
              {t('common.sortName')}
            </option>
            <option
              value={
                i18n.language === 'vi'
                  ? 'materialname_desc'
                  : 'materialnameen_desc'
              }
            >
              {t('common.sortNameDesc')}
            </option>
          </select>

          {/* Search Input */}
          <div className="relative group w-full md:w-auto">
            <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t('common.search')}
              className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
            />
          </div>

          {/* Add Button */}
          <button
            className={`px-4 py-2.5 text-sm font-medium text-white transition rounded-xl shadow-sm flex items-center justify-center gap-2 ${loadingInitialData ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            disabled={loadingInitialData}
            onClick={() => {
              if (brands.length === 0 || categories.length === 0) {
                toast.error(t('adminMaterialManager.noBrandAndService'));
                return;
              }
              setEditingMaterialID(null);
              setIsModalOpen(true);
            }}
          >
            {loadingInitialData ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                {t('common.loadingData', { defaultValue: 'Đang tải dữ liệu...' })}
              </>
            ) : (
              <>
                <i className="fa-solid fa-plus"></i>
                {t('BUTTON.AddNewMaterial')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* render modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterialID(null);
        }}
        onSave={handleSave}
        materialID={editingMaterialID}
        brands={brands}
        categories={categories}
        setUploadProgress={setUploadProgress}
        setSubmitting={setSubmitting}
      />

      {/* Content Area */}
      <div className="w-full">
        {/* Mobile List View (Hidden on Desktop) */}
        <div className="block md:hidden bg-gray-50 p-3 space-y-3">
          {materials && materials.length > 0 ? (
            materials.map((material) => {
              const { canEdit, canDelete } = getActionPermissions(material);
              return (
                <div
                  key={material.materialID}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Header Card */}
                  <div className="flex items-start gap-3 mb-3">
                    {material.imageUrls?.length > 0 && material.imageUrls[0] ? (
                      <img
                        src={material.imageUrls[0]}
                        alt={material.name}
                        className="object-cover w-16 h-16 border border-gray-200 rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <img
                        src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                        alt=""
                        className="object-cover border border-gray-200 rounded-lg w-16 h-16 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                        {i18n.language === 'vi'
                          ? material.name
                          : material.nameEN || material.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100">
                          {i18n.language === 'vi'
                            ? material.brandName
                            : material.brandNameEN || material.brandName}
                        </span>
                        <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-100">
                          {i18n.language === 'vi'
                            ? material.unit
                            : material.unitEN || material.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detail Line */}
                  <div className="text-xs text-gray-500 mb-3 px-1">
                    <span className="font-medium text-gray-600">
                      {t('distributorMaterialManager.category')}:{' '}
                    </span>
                    {i18n.language === 'vi'
                      ? material.categoryName
                      : material.categoryNameEN || material.categoryName}
                  </div>

                  {/* Action Buttons Mobile */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    {canEdit ? (
                      <button
                        onClick={async () => {
                          setEditingMaterialID(material.materialID);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg border border-amber-200 active:bg-amber-100"
                      >
                        <i className="fa-solid fa-pen"></i> {t('BUTTON.Edit')}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 py-2 text-sm text-gray-300 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed"
                      >
                        <i className="fa-solid fa-pen"></i> {t('BUTTON.Edit')}
                      </button>
                    )}

                    {canDelete ? (
                      <button
                        onClick={() => handleDelete(material.materialID)}
                        className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200 active:bg-red-100"
                      >
                        <i className="fa-solid fa-trash"></i>{' '}
                        {t('BUTTON.Delete')}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 py-2 text-sm text-gray-300 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed"
                      >
                        <i className="fa-solid fa-trash"></i>{' '}
                        {t('BUTTON.Delete')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // Mobile Empty State
            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl">
              <svg
                className="w-12 h-12 mb-3 text-gray-300"
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
              <p className="text-gray-500 text-sm">
                {t('distributorMaterialManager.noMaterial')}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          {/* NOSONAR */}
          <table className="w-full text-sm text-gray-700">
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
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                  {t('distributorMaterialManager.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials && materials.length > 0 ? (
                materials.map((material, index) => {
                  const { canEdit, canDelete } = getActionPermissions(material);
                  return (
                    <tr
                      key={material.materialID}
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

                      {/* Material Name + Avatar */}
                      <td className="flex items-center gap-3 px-6 py-4 text-left">
                        {material.imageUrls?.length > 0 &&
                        material.imageUrls[0] ? (
                          <img
                            src={material.imageUrls[0]}
                            alt={material.name}
                            className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                          />
                        ) : (
                          <img
                            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                            alt=""
                            className="object-cover border border-gray-200 rounded-lg w-13 h-13"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {i18n.language === 'vi'
                            ? material.name
                            : material.nameEN || material.name}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="px-6 py-4 text-center">
                        {i18n.language === 'vi'
                          ? material.brandName
                          : material.brandNameEN || material.brandName}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-center">
                        {i18n.language === 'vi'
                          ? material.categoryName
                          : material.categoryNameEN || material.categoryName}
                      </td>

                      {/* Unit */}
                      <td className="px-6 py-4 text-center">
                        {i18n.language === 'vi'
                          ? material.unit
                          : material.unitEN || material.unit}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {canEdit && (
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={async () => {
                                setEditingMaterialID(material.materialID);
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
                              onClick={() => handleDelete(material.materialID)}
                            >
                              <i className="fa-solid fa-trash"></i>{' '}
                              {t('BUTTON.Delete')}
                            </button>
                          )}

                          {!canEdit && !canDelete && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
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
                        {t('distributorMaterialManager.noMaterial')}
                      </h3>
                      <p className="mb-4 text-gray-500">
                        {t('distributorMaterialManager.letStart')}
                      </p>
                      <button
                        className={`px-4 py-2 text-white rounded-lg ${loadingInitialData ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        disabled={loadingInitialData}
                        onClick={() => {
                          if (brands.length === 0 || categories.length === 0) {
                            toast.error(t('adminMaterialManager.noBrandAndService'));
                            return;
                          }
                          setIsModalOpen(true);
                        }}
                      >
                        {loadingInitialData ? (
                          <>
                            <i className="mr-3 fa-solid fa-spinner fa-spin"></i>
                            {t('common.loadingData', { defaultValue: 'Đang tải dữ liệu...' })}
                          </>
                        ) : (
                          <>
                            <i className="mr-3 fa-solid fa-plus"></i>
                            {t('BUTTON.AddNewMaterial')}
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center py-4 bg-white border-t border-gray-100">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalMaterials}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            size="small"
            className="scale-90 md:scale-100"
          />
        </div>
      </div>
    </div>
  );
}

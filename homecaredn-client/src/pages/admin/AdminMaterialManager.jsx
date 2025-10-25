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
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialID, setEditingMaterialID] = useState(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
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
      SortBy: sortBy,
      Search: debouncedSearch || '',
    });
  }, [currentPage, pageSize, sortBy, debouncedSearch, fetchMaterials]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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

  // View (read-only)
  const handleView = async (m) => {
    setEditingMaterialID(m.materialID);
    setModalReadOnly(true);
    setIsModalOpen(true);
  };

  // Edit (owner only)
  const handleEdit = async (m) => {
    setEditingMaterialID(m.materialID);
    setModalReadOnly(false);
    setIsModalOpen(true);
  };

  // Save (Create / Update)
  const handleSave = async (materialData) => {
    if (modalReadOnly) {
      toast.info(t('common.viewOnly'));
      setIsModalOpen(false);
      setEditingMaterialID(null);
      return;
    }

    if (materialData.MaterialID) {
      await updateMaterial(materialData);
    } else {
      await createMaterial(materialData);
      const lastPage = Math.ceil((totalMaterials + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingMaterialID(null);
  };

  if (loading && !isModalOpen) return <Loading />;
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
          {/* Table Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
            {/* Left section: Search + Sort */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="w-full sm:w-64">
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder={t('common.search')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">{t('common.sortDefault')}</option>
                <option
                  value={
                    i18n.language === 'vi' ? 'materialname' : 'materialnameen'
                  }
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
            </div>

            {/* Add New Material Button */}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 sm:w-auto w-full"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              {t('BUTTON.AddNewMaterial')}
            </button>
          </div>

          {/* Modal */}
          <MaterialModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingMaterialID(null);
              setModalReadOnly(false);
            }}
            onSave={handleSave}
            materialID={editingMaterialID}
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
                    materials.map((material, index) => {
                      const ownedID = material.userID;
                      const creatorName = material.userName;

                      let displayName;
                      if (ownedID == user.id) {
                        displayName = 'Admin';
                      } else {
                        displayName = creatorName;
                      }

                      return (
                        <tr
                          key={material.materialID}
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
                                {material.imageUrls?.length > 0 &&
                                material.imageUrls[0] ? (
                                  <img
                                    src={material.imageUrls[0]}
                                    alt={material.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <img
                                    src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                                    alt=""
                                    className="object-cover w-10 h-10"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                )}
                              </div>
                              <div className="text-sm font-medium text-black">
                                {i18n.language === 'vi'
                                  ? material.name
                                  : material.nameEN || material.name}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center align-middle text-black">
                            {i18n.language === 'vi'
                              ? material.brandName
                              : material.brandNameEN || material.brandName}
                          </td>

                          <td className="px-6 py-4 text-center align-middle text-black">
                            {i18n.language === 'vi'
                              ? material.categoryName
                              : material.categoryNameEN ||
                                material.categoryName}
                          </td>

                          <td className="px-6 py-4 text-center align-middle text-black">
                            {i18n.language === 'vi'
                              ? material.unit
                              : material.unitEN || material.unit}
                          </td>

                          <td className="px-6 py-4 text-center align-middle text-black">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-md ">
                              {displayName}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-center align-middle">
                            <div className="flex justify-center space-x-2">
                              {ownedID === user.id ? (
                                <>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    onClick={() => handleEdit(material)}
                                  >
                                    {t('BUTTON.Edit')}
                                  </button>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                    onClick={() =>
                                      handleDelete(material.materialID)
                                    }
                                  >
                                    {t('BUTTON.Delete')}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    onClick={() => handleView(material)}
                                  >
                                    {t('BUTTON.View')}
                                  </button>
                                  <button
                                    className="px-3 py-2 text-xs font-medium border rounded-md border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                    onClick={() =>
                                      handleDelete(material.materialID)
                                    }
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
                              setEditingMaterialID(null);
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
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                {/* Total count (left) */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalMaterials} {t('adminMaterialManager.material')}
                  </span>
                </div>
                {/* Pagination (right) */}
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

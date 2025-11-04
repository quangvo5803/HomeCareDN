import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import LoadingComponent from '../../components/LoadingComponent';
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
  const [submitting, setSubmitting] = useState(false);

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

  const handleView = async (m) => {
    setEditingMaterialID(m.materialID);
    setModalReadOnly(true);
    setIsModalOpen(true);
  };

  const handleEdit = async (m) => {
    setEditingMaterialID(m.materialID);
    setModalReadOnly(false);
    setIsModalOpen(true);
  };

  const handleSave = async (materialData) => {
    if (modalReadOnly) {
      toast.info(t('common.viewOnly'));
      setIsModalOpen(false);
      setEditingMaterialID(null);
      return;
    }
    setSubmitting(true);

    if (materialData.MaterialID) {
      await updateMaterial(materialData);
    } else {
      await createMaterial(materialData);
      const lastPage = Math.ceil((totalMaterials + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingMaterialID(null);
    setSubmitting(false);
  };

  if (submitting || uploadProgress)
    return <Loading progress={uploadProgress} />;

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-tags text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {t('adminMaterialManager.title')}
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  {t('adminMaterialManager.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats Card */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-5 py-3 bg-orange-600 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-tags text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {loading ? 0 : totalMaterials || 0}
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      {t('adminMaterialManager.material')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search, Sort & Add Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
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

              <div className="relative group">
                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder={t('common.search')}
                  className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-md sm:w-auto w-full"
                onClick={() => {
                  if (brands.length === 0 || categories.length === 0) {
                    toast.error(t('adminMaterialManager.noBrandAndService'));
                    return;
                  }
                  setIsModalOpen(true);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                {t('BUTTON.AddNewMaterial')}
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Material Modal */}
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

        {/* Table Container */}
        <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-12 bg-gray-50 border-b-1">
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.no')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.materialName')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.brand')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.category')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.unit')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminMaterialManager.createdBy', {
                          defaultValue: 'Created By',
                        })}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('distributorMaterialManager.action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-10 text-center align-middle"
                        >
                          <LoadingComponent />
                        </td>
                      </tr>
                    ) : materials && materials.length > 0 ? (
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
                            <td className="px-4 py-4 text-center align-middle">
                              <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-600 rounded-full shadow-sm">
                                {(currentPage - 1) * pageSize + index + 1}
                              </span>
                            </td>

                            <td className="px-6 py-4 align-middle">
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
                                    />
                                  )}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {i18n.language === 'vi'
                                    ? material.name
                                    : material.nameEN || material.name}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                                {i18n.language === 'vi'
                                  ? material.brandName
                                  : material.brandNameEN || material.brandName}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span className="px-3 py-1 text-xs font-medium text-teal-800 bg-teal-100 rounded-full">
                                {i18n.language === 'vi'
                                  ? material.categoryName
                                  : material.categoryNameEN ||
                                    material.categoryName}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                {i18n.language === 'vi'
                                  ? material.unit
                                  : material.unitEN || material.unit}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span className="px-3 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                                {displayName}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-1">
                                {ownedID === user.id ? (
                                  <>
                                    <button
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                      onClick={() => handleEdit(material)}
                                    >
                                      {t('BUTTON.Edit')}
                                    </button>
                                    <button
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
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
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                      onClick={() => handleView(material)}
                                    >
                                      {t('BUTTON.View')}
                                    </button>
                                    <button
                                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
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
                        <td colSpan="7" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center text-center mt-5 mb-5">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <i className="fa-solid fa-tags text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {t('adminMaterialManager.noMaterial')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              {t('adminMaterialManager.letStart')}
                            </p>
                            <button
                              className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
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
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {loading ? (
                  <div className="py-10 text-center">
                    <LoadingComponent />
                  </div>
                ) : materials && materials.length > 0 ? (
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
                      <div
                        key={material.materialID}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                              {(currentPage - 1) * pageSize + index + 1}
                            </span>
                            <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg border border-gray-200">
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
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {i18n.language === 'vi'
                                  ? material.name
                                  : material.nameEN || material.name}
                              </h3>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                              {i18n.language === 'vi'
                                ? material.brandName
                                : material.brandNameEN || material.brandName}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                              {t('distributorMaterialManager.brand')}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-teal-800 bg-teal-100 rounded-full">
                              {i18n.language === 'vi'
                                ? material.categoryName
                                : material.categoryNameEN ||
                                  material.categoryName}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                              {t('distributorMaterialManager.category')}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              {i18n.language === 'vi'
                                ? material.unit
                                : material.unitEN || material.unit}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                              {t('distributorMaterialManager.unit')}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                              {displayName}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                              {t('adminMaterialManager.createdBy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {ownedID === user.id ? (
                            <>
                              <button
                                className="flex-1 px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                onClick={() => handleEdit(material)}
                              >
                                {t('BUTTON.Edit')}
                              </button>
                              <button
                                className="flex-1 px-3 py-2 text-xs font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
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
                                className="flex-1 px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                onClick={() => handleView(material)}
                              >
                                {t('BUTTON.View')}
                              </button>
                              <button
                                className="flex-1 px-3 py-2 text-xs font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
                                onClick={() =>
                                  handleDelete(material.materialID)
                                }
                              >
                                {t('BUTTON.Delete')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fa-solid fa-tags text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t('adminMaterialManager.noMaterial')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('adminMaterialManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                      onClick={() => {
                        if (brands.length === 0 || categories.length === 0) {
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
                )}
              </div>
            </div>

            {/* Pagination */}
            {!loading && totalMaterials > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalMaterials} {t('adminMaterialManager.material')}
                  </span>
                </div>
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalMaterials}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    size="small"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

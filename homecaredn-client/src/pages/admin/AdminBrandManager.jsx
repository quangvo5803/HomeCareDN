import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useBrand } from '../../hook/useBrand';
import { Pagination } from 'antd';
import BrandModal from '../../components/modal/BrandModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useDebounce } from 'use-debounce';
export default function AdminBrandManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrandID, setEditingBrandID] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const {
    brands,
    totalBrands,
    loading,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrand();

  // Load brands khi page change
  useEffect(() => {
    fetchBrands({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortBy,
      Search: debouncedSearch || '',
    });
  }, [currentPage, pageSize, sortBy, debouncedSearch, fetchBrands]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  const handleDelete = async (brandId) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteBrandModal.title',
      textKey: 'ModalPopup.DeleteBrandModal.text',
      onConfirm: async () => {
        await deleteBrand(brandId);

        const lastPage = Math.ceil((totalBrands - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          fetchBrands({
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

  const handleSave = async (brandData) => {
    if (brandData.BrandID) {
      await updateBrand(brandData);
      toast.success(t('SUCCESS.BRAND_UPDATE'));
    } else {
      await createBrand(brandData);
      toast.success(t('SUCCESS.BRAND_ADD'));
      const lastPage = Math.ceil((totalBrands + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingBrandID(null);
  };

  if (loading) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-star"></i>
            {t('adminBrandManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminBrandManager.subtitle')}</p>
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
                  value={i18n.language === 'vi' ? 'brandname' : 'brandnameen'}
                >
                  {t('common.sortName')}
                </option>
                <option
                  value={
                    i18n.language === 'vi'
                      ? 'brandname_desc'
                      : 'brandnameen_desc'
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
            </div>

            {/* Add New Brand Button */}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 sm:w-auto w-full"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              {t('BUTTON.AddNewBrand')}
            </button>
          </div>

          {/* Add/Edit Brand Modal */}
          <BrandModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingBrandID(null);
            }}
            onSave={handleSave}
            brandID={editingBrandID}
            setUploadProgress={setUploadProgress}
          />

          {/* Table */}
          <div className="w-full">
            {/* NOSONAR */}
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminBrandManager.no')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminBrandManager.brandName')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminBrandManager.numberOfMaterial')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminBrandManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {brands && brands.length > 0 ? (
                    brands.map((brand, index) => (
                      <tr
                        key={brand.brandID}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-4 py-4 text-center align-middle">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center justify-center w-10 h-10 mr-3 overflow-hidden rounded-lg">
                              {brand.brandLogo ? (
                                <img
                                  src={brand.brandLogo}
                                  alt={brand.brandName}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <img
                                  src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                                  alt="No image"
                                  className="object-cover w-13 h-13"
                                />
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {i18n.language === 'vi'
                                ? brand.brandName
                                : brand.brandNameEN || brand.brandName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            {brand.materials?.length || 0}{' '}
                            {t('adminBrandManager.materials')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setEditingBrandID(brand.brandID);
                                setIsModalOpen(true);
                              }}
                            >
                              {t('BUTTON.Edit')}
                            </button>
                            {brand.materials.length === 0 && (
                              <button
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
                                onClick={() => handleDelete(brand.brandID)}
                              >
                                {t('BUTTON.Delete')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
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
                            {t('adminBrandManager.noBrand')}
                          </h3>
                          <p className="mb-4 text-gray-500">
                            {t('adminBrandManager.letStart')}
                          </p>
                          <button
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <i className="mr-3 fa-solid fa-plus"></i>
                            {t('BUTTON.AddNewBrand')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {brands && brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <div
                      key={brand.brandID}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {i18n.language === 'vi'
                                ? brand.brandName
                                : brand.brandNameEN || brand.brandName}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-center">
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            {brand.materials?.length || 0}
                          </span>
                          <p className="mt-1 text-xs text-gray-500">
                            {t('adminBrandManager.materials')}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          onClick={() => {
                            setEditingBrandID(brand);
                            setIsModalOpen(true);
                          }}
                        >
                          {t('BUTTON.Edit')}
                        </button>
                        {brand.materials.length === 0 && (
                          <button
                            className="flex-1 px-3 py-2 text-xs font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
                            onClick={() => handleDelete(brand.brandID)}
                          >
                            {t('BUTTON.Delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-400"
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
                      {t('adminBrandManager.noBrand')}
                    </h3>
                    <p className="mb-4 text-gray-500">
                      {t('adminBrandManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="mr-3 fa-solid fa-plus"></i>
                      {t('BUTTON.AddNewBrand')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalBrands > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                {/* Total count (left) */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalBrands} {t('adminBrandManager.brands')}
                  </span>
                </div>

                {/* Pagination (right) */}
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalBrands}
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

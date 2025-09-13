import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import Swal from 'sweetalert2';
import { useBrand } from '../../hook/useBrand';
import { Pagination } from 'antd';
import BrandModal from '../../components/admin/BrandModal';

export default function AdminBrandManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

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
    fetchBrands({ PageNumber: currentPage, PageSize: pageSize });
  }, [currentPage, fetchBrands]);

  const handleDelete = async (brandId) => {
    Swal.fire({
      title: t('ModalPopup.DeleteBrandModal.title'),
      text: t('ModalPopup.DeleteBrandModal.text'),
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
            didOpen: () => Swal.showLoading(),
          });
          await deleteBrand(brandId);
          const lastPage = Math.ceil((totalBrands - 1) / pageSize);
          if (currentPage > lastPage) {
            setCurrentPage(lastPage || 1);
          } else {
            fetchBrands({ PageNumber: currentPage, PageSize: pageSize });
          }
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
        } catch {
          Swal.close();
        }
      }
    });
  };

  const handleSave = async (brandData) => {
    if (brandData.BrandID) {
      await updateBrand(brandData, {
        PageNumber: currentPage,
        PageSize: pageSize,
      });
      toast.success(t('SUCCESS.BRAND_UPDATE'));
    } else {
      await createBrand(brandData, { PageNumber: 1, PageSize: pageSize });
      toast.success(t('SUCCESS.BRAND_ADD'));
      const lastPage = Math.ceil((totalBrands + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingBrand(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            <i className="fa-solid fa-globe mr-3"></i>
            {t('adminBrandManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminBrandManager.subtitle')}</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header Actions */}
          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {totalBrands || 0} {t('adminBrandManager.brands')}
              </span>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              {t('BUTTON.AddNewBrand')}
            </button>
          </div>

          {/* Add/Edit Brand Modal */}
          <BrandModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingBrand(null);
            }}
            onSave={handleSave}
            brand={editingBrand}
          />

          {/* Table */}
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('adminBrandManager.no')}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('adminBrandManager.brandName')}
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('adminBrandManager.numberOfMaterial')}
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                              {brand.brandLogo ? (
                                <img
                                  src={brand.brandLogo}
                                  alt={brand.brandName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {brand.brandName.charAt(0)}
                                  </span>
                                </div>
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
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {brand.materials?.length || 0}{' '}
                            {t('adminBrandManager.materials')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className="inline-flex items-center px-3 py-2 border border-amber-300 rounded-md text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setEditingBrand(brand);
                                setIsModalOpen(true);
                              }}
                            >
                              {t('BUTTON.Edit')}
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                              onClick={() => handleDelete(brand.brandID)}
                            >
                              {t('BUTTON.Delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
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
                            {t('adminBrandManager.noBrand')}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {t('adminBrandManager.letStart')}
                          </p>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <i className="fa-solid fa-plus mr-3"></i>
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
              <div className="space-y-4 p-4">
                {brands && brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <div
                      key={brand.brandID}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">
                              {i18n.language === 'vi'
                                ? brand.brandName
                                : brand.brandNameEN || brand.brandName}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {brand.materials?.length || 0}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {t('adminBrandManager.materials')}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-3 py-2 border border-amber-300 rounded-md text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                          onClick={() => {
                            setEditingBrand(brand);
                            setIsModalOpen(true);
                          }}
                        >
                          {t('BUTTON.Edit')}
                        </button>
                        {brand.materials === 0 && (
                          <button
                            className="flex-1 px-3 py-2 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100"
                            onClick={() => handleDelete(brand.brandID)}
                          >
                            {t('BUTTON.Delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4 mx-auto"
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
                      {t('adminBrandManager.noBrand')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('adminBrandManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="fa-solid fa-plus mr-3"></i>
                      {t('BUTTON.AddNewBrand')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center py-4">
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
        </div>
      </div>
    </div>
  );
}

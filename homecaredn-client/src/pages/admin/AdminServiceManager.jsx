import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { Pagination } from 'antd';
import ServiceModal from '../../components/modal/ServiceModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useService } from '../../hook/useService';
import { useDebounce } from 'use-debounce';

export default function AdminServiceManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceID, setEditingServiceID] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const {
    services,
    totalServices,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useService();

  // Load services khi page change
  useEffect(() => {
    fetchServices({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortBy,
      Search: debouncedSearch || '',
    });
  }, [currentPage, pageSize, sortBy, debouncedSearch, fetchServices]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (serviceID) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteServiceModal.title',
      textKey: 'ModalPopup.DeleteServiceModal.text',
      onConfirm: async () => {
        await deleteService(serviceID);

        const lastPage = Math.ceil((totalServices - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          fetchServices({
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

  const handleSave = async (serviceData) => {
    if (serviceData.ServiceID) {
      await updateService(serviceData);
    } else {
      await createService(serviceData);
      const lastPage = Math.ceil((totalServices + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingServiceID(null);
    setUploadProgress(0);
  };

  if (loading && !isModalOpen) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;
  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-gear"></i>
            {t('adminServiceManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminServiceManager.subtitle')}</p>
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
                    i18n.language === 'vi' ? 'servicename' : 'servicenameen'
                  }
                >
                  {t('common.sortName')}
                </option>
                <option
                  value={
                    i18n.language === 'vi'
                      ? 'servicename_desc'
                      : 'servicenameen_desc'
                  }
                >
                  {t('common.sortNameDesc')}
                </option>
              </select>
            </div>

            {/* Add New Service Button */}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 sm:w-auto w-full"
              onClick={() => {
                setIsModalOpen(true);
                setEditingServiceID(null);
              }}
            >
              <i className="fa-solid fa-plus"></i>
              {t('BUTTON.AddNewService')}
            </button>
          </div>

          {/* Add/Edit Service Modal */}
          <ServiceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingServiceID(null);
            }}
            onSave={handleSave}
            serviceID={editingServiceID}
            setUploadProgress={setUploadProgress}
          />

          {/* Table */}
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.no')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.serviceName')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.serviceType')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.buildingType')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services && services.length > 0 ? (
                    services.map((svc, index) => (
                      <tr
                        key={svc.serviceID}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-4 py-4 text-center align-middle">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle text-black">
                          <div className="whitespace-normal break-words max-w-[500px] mx-auto">
                            {i18n.language === 'vi'
                              ? svc.name
                              : svc.nameEN || svc.name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center align-middle text-black">
                          {t(`Enums.ServiceType.${svc.serviceType}`)}
                        </td>
                        <td className="px-6 py-4 text-center align-middle text-black">
                          {t(`Enums.BuildingType.${svc.buildingType}`)}
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={async () => {
                                setEditingServiceID(svc.serviceID);
                                setIsModalOpen(true);
                              }}
                            >
                              {t('BUTTON.Edit')}
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
                              onClick={() => handleDelete(svc.serviceID)}
                            >
                              {t('BUTTON.Delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
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
                            {t('adminServiceManager.noService')}
                          </h3>
                          <p className="mb-4 text-gray-500">
                            {t('adminServiceManager.letStart')}
                          </p>
                          <button
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <i className="mr-3 fa-solid fa-plus"></i>
                            {t('BUTTON.AddNewService')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalServices > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                {/* Total count (left) */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalServices} {t('adminServiceManager.services')}
                  </span>
                </div>
                {/* Pagination (right) */}
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalServices}
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

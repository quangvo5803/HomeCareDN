import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { Pagination } from 'antd';
import ServiceModal from '../../components/modal/ServiceModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useService } from '../../hook/useService';

export default function AdminServiceManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    services,
    totalServices,
    loading,
    fetchServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
  } = useService();

  // Load services khi page change
  useEffect(() => {
    fetchServices({ PageNumber: currentPage, PageSize: pageSize });
  }, [currentPage, fetchServices]);

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
          fetchServices({ PageNumber: currentPage, PageSize: pageSize });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };

  const handleSave = async (serviceData) => {
    if (serviceData.ServiceID) {
      await updateService(serviceData);
      toast.success(t('SUCCESS.SERVICE_UPDATE'));
    } else {
      await createService(serviceData);
      toast.success(t('SUCCESS.SERVICE_ADD'));
      const lastPage = Math.ceil((totalServices + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingService(null);
    setUploadProgress(0);
  };

  if (loading) return <Loading />;
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
          <div className="flex flex-col items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 lg:px-6 bg-gray-50 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {totalServices || 0} {t('adminServiceManager.services')}
              </span>
            </div>
            <button
              className="w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="mr-2 fa-solid fa-plus"></i>
              {t('BUTTON.AddNewService')}
            </button>
          </div>

          {/* Add/Edit Service Modal */}
          <ServiceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingService(null);
            }}
            onSave={handleSave}
            service={editingService}
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
                        className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
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
                              onClick={ async()  => {
                                var res = await getServiceById(svc.serviceID);
                                setEditingService(res);
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
              <div className="flex justify-center py-4">
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

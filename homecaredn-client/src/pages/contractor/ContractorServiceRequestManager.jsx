import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import { formatVND } from '../../utils/formatters';
import { useNavigate } from "react-router-dom";

export default function ContractorServiceRequestManager() {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [sortOption, setSortOption] = useState('');
    const navigate = useNavigate();

    const {
        fetchServiceRequests,
        totalServiceRequests,
        loading,
        serviceRequests,
    } = useServiceRequest();

    useEffect(() => {
        fetchServiceRequests({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortOption,
        });
    }, [currentPage, pageSize, fetchServiceRequests, sortOption]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
            <div className="w-full max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
                        <i className="mr-3 fa-solid fa-list-alt" />
                        {t('contractorServiceRequestManager.title')}
                    </h2>
                    <p className="text-gray-600">{t('contractorServiceRequestManager.subtitle')}</p>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
                    {/* Table Header Actions */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-gray-700">
                                {totalServiceRequests || 0} {t('contractorServiceRequestManager.serviceRequests')}
                            </span>
                        </div>

                        {/* Search and Sort */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Sort Dropdown */}
                            <select
                                id="status-filter"
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">
                                    {t('contractorServiceRequestManager.sortDefault')}
                                </option>
                                <option value="createdat">
                                    {t('contractorServiceRequestManager.sortOldest')}
                                </option>
                                <option value="createdat_desc">
                                    {t('contractorServiceRequestManager.sortNewest')}
                                </option>
                            </select>

                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full">
                        {/* Desktop - Card Layout (khác với Admin table) */}
                        <div className="hidden lg:block">
                            <div className="p-6 space-y-4">
                                {serviceRequests && serviceRequests.length > 0 ? (
                                    serviceRequests.map((request) => (
                                        <div key={request.serviceRequestID} 
                                             className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                            {/* Request Card Content */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {t(`Enums.ServiceType.${request.serviceType}`)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm ${
                                                    request.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {request.isOpen ? t('contractorServiceRequestManager.statusOpen') : t('contractorServiceRequestManager.statusClosed')}
                                                </span>
                                            </div>
                                            
                                            {/* Request Details */}
                                            <div className="grid grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('contractorServiceRequestManager.packageOption')}</p>
                                                    <p className="font-medium">{t(`Enums.PackageOption.${request.packageOption}`)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('contractorServiceRequestManager.buildingType')}</p>
                                                    <p className="font-medium">{t(`Enums.BuildingType.${request.buildingType}`)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('contractorServiceRequestManager.area')}</p>
                                                    <p className="font-medium">{request.width * request.length} m²</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('contractorServiceRequestManager.estimatePrice')}</p>
                                                    <p className="font-medium text-orange-600">
                                                        {request.estimatePrice ? formatVND(request.estimatePrice) : t('contractorServiceRequestManager.negotiable')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-between items-center pt-4 border-t">
                                                <p className="text-sm text-gray-500">
                                                    {t('contractorServiceRequestManager.createdAt')}: {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                                <button
                                                    onClick={() => navigate(`/Contractor/service-request/${request.serviceRequestID}`)}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                                                >
                                                    {t('BUTTON.View')}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <i className="text-4xl mb-4 text-gray-400 fa-solid fa-list-alt"></i>
                                            <h3 className="mb-1 text-lg font-medium text-gray-900">
                                                {t('contractorServiceRequestManager.noRequest')}
                                            </h3>
                                            <p className="text-gray-500">
                                                {t('contractorServiceRequestManager.letStart')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile - Card Layout */}
                        <div className="lg:hidden">
                            <div className="p-4 space-y-4">
                                {serviceRequests && serviceRequests.length > 0 ? (
                                    serviceRequests.map((request) => (
                                        <div key={request.serviceRequestID} 
                                             className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {t(`Enums.ServiceType.${request.serviceType}`)}
                                                    </h3>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    request.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {request.isOpen ? t('contractorServiceRequestManager.statusOpen') : t('contractorServiceRequestManager.statusClosed')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                                <div>
                                                    <span className="text-gray-500">{t('contractorServiceRequestManager.buildingType')}: </span>
                                                    <span className="font-medium">{t(`Enums.BuildingType.${request.buildingType}`)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">{t('contractorServiceRequestManager.area')}: </span>
                                                    <span className="font-medium">{request.width * request.length} m²</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-orange-600 font-medium">
                                                    {request.estimatePrice ? formatVND(request.estimatePrice) : t('contractorServiceRequestManager.negotiable')}
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/Contractor/service-request/${request.serviceRequestID}`)}
                                                    className="px-3 py-1 text-xs font-medium border rounded border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                                                >
                                                    {t('BUTTON.View')}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <i className="text-4xl mb-4 text-gray-400 fa-solid fa-list-alt"></i>
                                        <h3 className="mb-1 text-lg font-medium text-gray-900">
                                            {t('contractorServiceRequestManager.noRequest')}
                                        </h3>
                                        <p className="text-gray-500">
                                            {t('contractorServiceRequestManager.letStart')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination - */}
                        {totalServiceRequests > 0 && (
                            <div className="flex justify-center py-4">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={totalServiceRequests}
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

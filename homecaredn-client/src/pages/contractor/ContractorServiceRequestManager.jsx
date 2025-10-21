import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState, useMemo } from 'react';
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

    // Chỉ hiển thị (không đổi logic): “X–Y / N”
    const rangeText = useMemo(() => {
        if (!totalServiceRequests) return '';
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalServiceRequests);
        return `${start}-${end} / ${totalServiceRequests}`;
    }, [currentPage, pageSize, totalServiceRequests]);

    // Chỉ UI: icon & màu theo loại dịch vụ
    const serviceTypeStyle = {
        Construction: { icon: 'fa-hard-hat', tint: 'text-indigo-600', ring: 'ring-indigo-100' },
        Repair: { icon: 'fa-screwdriver-wrench', tint: 'text-emerald-600', ring: 'ring-emerald-100' },
        MaterialOrder: { icon: 'fa-cart-flatbed', tint: 'text-amber-600', ring: 'ring-amber-100' },
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="w-full max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
                        <i className="mr-3 fa-solid fa-list-alt" />
                        {t('contractorServiceRequestManager.title')}
                    </h2>
                    <p className="text-gray-600">{t('contractorServiceRequestManager.subtitle')}</p>
                </div>

                {/* Container */}
                <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center flex-wrap gap-3">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm bg-white ring-1 ring-gray-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="font-medium text-gray-700">
                                    {totalServiceRequests || 0} {t('contractorServiceRequestManager.serviceRequests')}
                                </span>
                            </div>
                            {!!rangeText && (
                                <span className="text-xs text-gray-500" aria-label="range">
                                    {rangeText}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                id="status-filter"
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                aria-label="Sort service requests"
                            >
                                <option value="">{t('contractorServiceRequestManager.sortDefault')}</option>
                                <option value="createdat">{t('contractorServiceRequestManager.sortOldest')}</option>
                                <option value="createdat_desc">{t('contractorServiceRequestManager.sortNewest')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full">
                        {/* Desktop */}
                        <div className="hidden lg:block">
                            <div className="p-6 space-y-4">
                                {serviceRequests && serviceRequests.length > 0 ? (
                                    serviceRequests.map((request) => {
                                        const ui = serviceTypeStyle[request?.serviceType] || { icon: 'fa-wrench', tint: 'text-gray-600', ring: 'ring-gray-100' };
                                        const addressParts = [
                                            request?.address?.provined,
                                            request?.address?.district,
                                            request?.address?.city,
                                        ].filter(Boolean);
                                        const addressText = addressParts.join(', ') || '—';
                                        return (
                                            <div
                                                key={request.serviceRequestID}
                                                className={`group relative bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                                                    ${request.isOpen ? 'border-green-200' : 'border-gray-200'}`}
                                            >
                                                {/* Left accent bar */}
                                                <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl
                                                    ${request.isOpen ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-gray-200'}`} />

                                                {/* Header row */}
                                                <div className="flex justify-between items-start mb-4 pl-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full bg-white ring-4 ${ui.ring}`}>
                                                                <i className={`fa-solid ${ui.icon} ${ui.tint}`} />
                                                            </span>
                                                            {t(`Enums.ServiceType.${request.serviceType}`)}
                                                        </h3>

                                                        {/* Location (desktop) */}
                                                        <div className="mt-1 flex items-center text-sm text-gray-500 gap-2">
                                                            <i className="fa-solid fa-location-dot text-gray-400" />
                                                            <span className="truncate max-w-[56rem]" title={addressText}>
                                                                {addressText}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ring-1 ring-inset
                                                            ${request.isOpen
                                                                ? 'bg-green-50 text-green-700 ring-green-200'
                                                                : 'bg-gray-50 text-gray-700 ring-gray-200'}`}
                                                    >
                                                        <span className="relative flex h-2.5 w-2.5">
                                                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75
                                                                ${request.isOpen ? 'bg-green-400 animate-ping' : 'bg-gray-300'}`} />
                                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5
                                                                ${request.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                        </span>
                                                        {request.isOpen
                                                            ? t('contractorServiceRequestManager.statusOpen')
                                                            : t('contractorServiceRequestManager.statusClosed')}
                                                    </span>
                                                </div>

                                                {/* Meta chips */}
                                                <div className="pl-3 mb-4 flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                        <i className="fa-solid fa-box-open" />
                                                        {t(`Enums.PackageOption.${request.packageOption}`)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                        <i className="fa-solid fa-building" />
                                                        {t(`Enums.BuildingType.${request.buildingType}`)}
                                                    </span>
                                                    {(request?.floors ?? 0) > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                            <i className="fa-solid fa-layer-group" />
                                                            {request.floors} {t('contractorServiceRequestDetail.floorsUnit')}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                                                        bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                                                        <i className="fa-solid fa-coins" />
                                                        {request.estimatePrice ? formatVND(request.estimatePrice) : t('contractorServiceRequestManager.negotiable')}
                                                    </span>
                                                </div>

                                                {/* Footer row */}
                                                <div className="flex justify-between items-center pt-4 border-t pl-3">
                                                    <p className="text-sm text-gray-500">
                                                        {t('contractorServiceRequestManager.createdAt')}: {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/Contractor/service-request/${request.serviceRequestID}`)}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                                                    >
                                                        <i className="fa-solid fa-eye mr-2" />
                                                        {t('BUTTON.View')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
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

                        {/* Mobile */}
                        <div className="lg:hidden">
                            <div className="p-4 space-y-4">
                                {serviceRequests && serviceRequests.length > 0 ? (
                                    serviceRequests.map((request) => {
                                        const ui = serviceTypeStyle[request?.serviceType] || { icon: 'fa-wrench', tint: 'text-gray-600' };
                                        const addressParts = [
                                            request?.address?.provined,
                                            request?.address?.district,
                                            request?.address?.city,
                                        ].filter(Boolean);
                                        const addressText = addressParts.join(', ') || '—';

                                        return (
                                            <div
                                                key={request.serviceRequestID}
                                                className={`p-4 bg-white border rounded-xl shadow-sm transition hover:border-blue-200 hover:shadow
                                                    ${request.isOpen ? 'border-green-200' : 'border-gray-200'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                            <i className={`fa-solid ${ui.icon} ${ui.tint}`} />
                                                            {t(`Enums.ServiceType.${request.serviceType}`)}
                                                        </h3>

                                                        {/* Location (mobile) */}
                                                        <div className="mt-1 flex items-center text-xs text-gray-500 gap-1">
                                                            <i className="fa-solid fa-location-dot text-gray-400" />
                                                            <span className="truncate" title={addressText}>
                                                                {addressText}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ring-1 ring-inset
                                                            ${request.isOpen
                                                                ? 'bg-green-50 text-green-700 ring-green-200'
                                                                : 'bg-gray-50 text-gray-700 ring-gray-200'}`}
                                                    >
                                                        {request.isOpen
                                                            ? t('contractorServiceRequestManager.statusOpen')
                                                            : t('contractorServiceRequestManager.statusClosed')}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                        <i className="fa-solid fa-building" />
                                                        {t(`Enums.BuildingType.${request.buildingType}`)}
                                                    </span>
                                                    {(request?.floors ?? 0) > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                            <i className="fa-solid fa-layer-group" />
                                                            {request.floors} {t('contractorServiceRequestDetail.floorsUnit')}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                        <i className="fa-solid fa-ruler-combined" />
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="text-xs text-orange-600 font-semibold inline-flex items-center gap-1">
                                                        <i className="fa-solid fa-coins" />
                                                        {request.estimatePrice ? formatVND(request.estimatePrice) : t('contractorServiceRequestManager.negotiable')}
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/Contractor/service-request/${request.serviceRequestID}`)}
                                                        className="px-3 py-1 text-xs font-medium border rounded border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                                                    >
                                                        <i className="fa-solid fa-eye mr-1" />
                                                        {t('BUTTON.View')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
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

                        {/* Pagination */}
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

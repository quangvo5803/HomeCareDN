import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Pagination } from 'antd';
import { formatVND } from '../../utils/formatters';
import { useNavigate } from "react-router-dom";

export default function ServiceRequest() {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 1000);
    const [sortOption, setSortOption] = useState('');

    const navigate = useNavigate();

    const {
        fetchServiceRequests,
        totalServiceRequests,
        loading,
        serviceRequests,
    } = useServiceRequest();

    // Gọi API list
    useEffect(() => {
        fetchServiceRequests({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortOption,
            Search: debouncedSearch || '',
        });
    }, [currentPage, pageSize, debouncedSearch, fetchServiceRequests, sortOption]);


    if (loading) return <Loading />;

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
            <div className="w-full max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
                        <i className="mr-3 fa-solid fa-truck" />
                        {t('adminServiceRequestManager.title')}
                    </h2>
                    <p className="text-gray-600">{t('adminServiceRequestManager.subtitle')}</p>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
                    {/* Table Header Actions */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-gray-700">
                                {totalServiceRequests || 0} {t('adminServiceRequestManager.serviceRequests')}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Filter by status */}
                            <select
                                id="status-filter"
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option>
                                    Mặc định
                                </option>
                                <option value="createdat">
                                    Cũ nhất
                                </option>

                                <option value="createdat_desc">
                                    Mới nhất
                                </option>

                            </select>

                            {/* Search */}
                            <input
                                id="search-input"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('common.search')}
                                className="px-3 py-2 text-sm border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full">
                        <div className="hidden lg:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-4 text-xs font-semibold text-center text-gray-600 uppercase">
                                            {t('adminServiceRequestManager.no')}
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">
                                            {t('sharedEnums.serviceType')}
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">
                                            {t('sharedEnums.buildingType')}
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">
                                            {t('adminServiceRequestManager.estimatePrice')}
                                        </th>
                                        <th className="px-4 py-4 text-xs font-semibold text-center text-gray-600 uppercase">
                                            {t('adminServiceManager.action')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {serviceRequests && serviceRequests.length > 0 ? (
                                        serviceRequests.map((item, idx) => (
                                            <tr
                                                key={item.serviceRequestID}
                                                className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                                        {(currentPage - 1) * pageSize + idx + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-black">
                                                    {t(`Enums.ServiceType.${item.serviceType}`)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-black">
                                                    {t(`Enums.BuildingType.${item.buildingType}`)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-black">
                                                    {formatVND(Number(item.estimatePrice))}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {item.isOpen ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/Admin/ServiceRequest/${item.serviceRequestID}`)}
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                                                        >
                                                            {t('BUTTON.View')}
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-red-500">
                                                            <i className="fas fa-clock mr-1"></i>
                                                            {t('userPage.serviceRequest.label_close')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center mt-5 mb-5">
                                                    <i className="text-4xl mb-2 mt-2 fa-solid fa-truck"></i>
                                                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                                                        {t('adminPartnerManager.empty')}
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        {t('adminPartnerManager.empty_description')}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

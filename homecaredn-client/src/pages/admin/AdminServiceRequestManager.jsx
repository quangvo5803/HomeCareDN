import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Pagination } from 'antd';
import { formatVND } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import useRealtime from '../../hook/useRealtime';
import { useAuth } from '../../hook/useAuth';

export default function ServiceRequest() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const [sortOption, setSortOption] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'

  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchServiceRequests,
    setServiceRequests,
    setTotalServiceRequests,
    totalServiceRequests,
    loading,
    serviceRequests,
  } = useServiceRequest();
  useRealtime(user, 'Admin', {
    onNewServiceRequest: (payload) => {
      setServiceRequests((prev) => {
        if (prev.some((r) => r.serviceRequestID === payload.serviceRequestID)) {
          return prev; // tránh duplicate
        }
        return [payload, ...prev];
      });
      setTotalServiceRequests((prev) => prev + 1);
    },
    onDeleteServiceRequest: (payload) => {
      setServiceRequests((prev) =>
        prev.filter((r) => r.serviceRequestID !== payload.serviceRequestID)
      );
      setTotalServiceRequests((prev) => Math.max(0, prev - 1));
    },
    onNewContractorApplication: (payload) => {
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                contractorApplyCount: (sr.contractorApplyCount || 0) + 1,
              }
            : sr
        )
      );
    },
    onAcceptedContractorApplication: (payload) => {
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                status: 'Closed',
              }
            : sr
        )
      );
    },
    onDeleteContractorApplication: (payload) => {
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                contractorApplyCount: Math.max(
                  0,
                  (sr.contractorApplyCount || 1) - 1
                ),
              }
            : sr
        )
      );
    },

    // 🔸 Khi trạng thái thanh toán thay đổi (Contractor đã thanh toán)
    onPaymentUpdate: (payload) => {
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                status: 'Closed',
              }
            : sr
        )
      );
    },
  });
  useEffect(() => {
    fetchServiceRequests({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortOption,
      Search: debouncedSearch || '',
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, sortOption, debouncedSearch]);

  const serviceTypeStyle = {
    Construction: {
      icon: 'fa-hammer',
      gradient: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      ringColor: 'ring-orange-300',
    },
    Repair: {
      icon: 'fa-screwdriver-wrench',
      gradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      ringColor: 'ring-blue-300',
    },
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <i className="fa-solid fa-clipboard-list text-white text-2xl" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {t('adminServiceRequestManager.title')}
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  {t('adminServiceRequestManager.subtitle')}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-table mr-2" />
                {t('common.Table')}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-grip mr-2" />
                {t('common.Grid')}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats Cards */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative overflow-hidden px-5 py-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/30">
                <div className="absolute inset-0 bg-white opacity-10"></div>
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <i className="fa-solid fa-clipboard-list text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {totalServiceRequests || 0}
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      {t('adminServiceRequestManager.serviceRequests')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              >
                <option value="">{t('common.sortDefault')}</option>
                <option value="createdat">
                  {t('common.sortCreateDateOld')}
                </option>
                <option value="createdat_desc">
                  {t('common.sortCreateDateNew')}
                </option>
              </select>

              <div className="relative group">
                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('common.search')}
                  className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {serviceRequests && serviceRequests.length > 0 ? (
              serviceRequests.map((item) => {
                const ui = serviceTypeStyle[item?.serviceType] || {
                  icon: 'fa-wrench',
                  gradient: 'from-gray-400 to-gray-500',
                  lightBg: 'bg-gray-50',
                  textColor: 'text-gray-700',
                  borderColor: 'border-gray-200',
                  ringColor: 'ring-gray-300',
                };

                const addressParts = [
                  item?.address?.detail,
                  item?.address?.ward,
                  item?.address?.district,
                  item?.address?.city,
                ].filter(Boolean);
                const addressText = addressParts.join(', ') || '—';

                return (
                  <div
                    key={item.serviceRequestID}
                    className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300"
                  >
                    {/* Gradient Header */}
                    <div
                      className={`h-2 bg-gradient-to-r ${ui.gradient}`}
                    ></div>

                    <div className="p-6">
                      {/* Service Type Icon & Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${ui.lightBg} rounded-xl flex items-center justify-center ring-2 ${ui.ringColor} transition-transform duration-300 group-hover:scale-110`}
                          >
                            <i
                              className={`fa-solid ${ui.icon} ${ui.textColor} text-xl`}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {t(`Enums.ServiceType.${item.serviceType}`)}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <i className="fa-solid fa-calendar" />
                              <span>
                                {new Date(item.createdAt).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={item.status} type="Request" />
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-3 mb-4">
                        {/* Building Type */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-building text-purple-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('sharedEnums.buildingType')}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {t(`Enums.BuildingType.${item.buildingType}`)}
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-location-dot text-blue-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('adminServiceRequestManager.address')}
                            </div>
                            <div
                              className="text-sm font-semibold text-gray-900 line-clamp-2 break-words max-w-full"
                              title={addressText}
                            >
                              {addressText}
                            </div>
                          </div>
                        </div>

                        {/* Area & Floors */}
                        {item.floors > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="fa-solid fa-ruler-combined text-teal-600 text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 font-medium">
                                Dimensions
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {(
                                  item.length *
                                  item.width *
                                  item.floors
                                ).toFixed(1)}{' '}
                                m² • {item.floors}{' '}
                                {t('adminServiceRequestManager.floors')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-coins text-amber-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('adminServiceRequestManager.estimatePrice')}
                            </div>
                            <div className="text-base font-bold text-orange-600">
                              {item.estimatePrice != 0
                                ? formatVND(Number(item.estimatePrice))
                                : t(
                                    'contractorServiceRequestManager.negotiable'
                                  )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/Admin/ServiceRequest/${item.serviceRequestID}`
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40"
                      >
                        <i className="fa-solid fa-eye" />
                        {t('BUTTON.View')}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <i className="fa-solid fa-clipboard-list text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('adminServiceRequestManager.empty')}
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      {t('adminServiceRequestManager.empty_description')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-orange-50/30 border-b-2 border-orange-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceRequestManager.no')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('sharedEnums.serviceType')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('sharedEnums.buildingType')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceRequestManager.address')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceRequestManager.acreage')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceRequestManager.estimatePrice')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceRequestManager.status')}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminServiceManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serviceRequests && serviceRequests.length > 0 ? (
                    serviceRequests.map((item, idx) => {
                      const ui = serviceTypeStyle[item?.serviceType] || {
                        icon: 'fa-wrench',
                        lightBg: 'bg-gray-50',
                        textColor: 'text-gray-700',
                      };

                      const addressParts = [
                        item?.address?.detail,
                        item?.address?.ward,
                        item?.address?.district,
                        item?.address?.city,
                      ].filter(Boolean);
                      const addressText = addressParts.join(', ') || '—';

                      return (
                        <tr
                          key={item.serviceRequestID}
                          className="hover:bg-orange-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-white bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-sm">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 ${ui.lightBg} rounded-lg flex items-center justify-center`}
                              >
                                <i
                                  className={`fa-solid ${ui.icon} ${ui.textColor}`}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {t(`Enums.ServiceType.${item.serviceType}`)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {t(`Enums.BuildingType.${item.buildingType}`)}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                            title={addressText}
                          >
                            <i className="fa-solid fa-location-dot text-orange-500 mr-2" />
                            {addressText}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.floors > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold">
                                  {(
                                    item.length *
                                    item.width *
                                    item.floors
                                  ).toFixed(1)}{' '}
                                  m²
                                </span>
                                <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold">
                                  {item.floors}{' '}
                                  {t('adminServiceRequestManager.floors')}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-orange-600">
                            {formatVND(Number(item.estimatePrice))}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} type="Request" />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/Admin/ServiceRequest/${item.serviceRequestID}`
                                )
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md shadow-orange-500/25"
                            >
                              <i className="fa-solid fa-eye" />
                              {t('BUTTON.View')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-16">
                        <div className="flex flex-col items-center text-center mt-5 mb-5">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                            <i className="fa-solid fa-clipboard-list text-gray-400 text-3xl" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {t('adminServiceRequestManager.empty')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t('adminServiceRequestManager.empty_description')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Pagination */}
        {totalServiceRequests > 0 && (
          <div className="border-t border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-orange-50/30">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalServiceRequests}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

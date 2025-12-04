import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import { formatVND, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useAuth } from '../../hook/useAuth';

export default function ServiceRequest() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
  useRealtime({
    [RealtimeEvents.ServiceRequestCreated]: (payload) => {
      setServiceRequests((prev) => {
        if (prev.some((r) => r.serviceRequestID === payload.serviceRequestID)) {
          return prev;
        }
        return [payload, ...prev];
      });
      setTotalServiceRequests((prev) => prev + 1);
    },
    [RealtimeEvents.ServiceRequestDelete]: (payload) => {
      setServiceRequests((prev) =>
        prev.filter((r) => r.serviceRequestID !== payload.serviceRequestID)
      );
      setTotalServiceRequests((prev) => Math.max(0, prev - 1));
    },
    [RealtimeEvents.ContractorApplicationCreated]: (payload) => {
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
    [RealtimeEvents.ContractorApplicationAccept]: (payload) => {
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
    [RealtimeEvents.ContractorApplicationDelete]: (payload) => {
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
    [RealtimeEvents.PaymentTransactionUpdated]: (payload) => {
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, sortOption]);

  const serviceTypeStyle = {
    Construction: {
      icon: 'fa-hammer',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      ringColor: 'ring-orange-300',
    },
    Repair: {
      icon: 'fa-screwdriver-wrench',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      ringColor: 'ring-blue-300',
    },
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-clipboard-list text-white text-2xl" />
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${viewMode === 'table'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <i className="fa-solid fa-table mr-2" />
                {t('common.Table')}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${viewMode === 'grid'
                  ? 'bg-orange-500 text-white shadow-md'
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
              <div className="px-5 py-3 bg-orange-500 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-clipboard-list text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {loading ? 0 : totalServiceRequests || 0}
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
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
              >
                <option value="">{t('common.sortDefault')}</option>
                <option value="createdat">
                  {t('common.sortCreateDateOld')}
                </option>
                <option value="createdat_desc">
                  {t('common.sortCreateDateNew')}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-10 text-center">
                <LoadingComponent />
              </div>
            ) : serviceRequests && serviceRequests.length > 0 ? (
              serviceRequests.map((item) => {
                const ui = serviceTypeStyle[item?.serviceType] || {
                  icon: 'fa-wrench',
                  bgColor: 'bg-gray-400',
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
                    <div className={`h-2 ${ui.bgColor}`}></div>

                    <div className="p-6">
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
                                {formatDate(item.createdAt, i18n.language)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={item.status} type="Request" />
                      </div>

                      <div className="space-y-3 mb-4">
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

                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-coins text-amber-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('adminServiceRequestManager.estimatePrice')}
                            </div>
                            <div className="text-base font-bold text-orange-500">
                              {item.estimatePrice == 0
                                ? t(
                                  'contractorServiceRequestManager.negotiable'
                                )
                                : formatVND(Number(item.estimatePrice))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/Admin/ServiceRequestManager/${item.serviceRequestID}`
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md cursor-pointer"
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
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
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
          <>
            {/* Table View */}
            <div className="hidden md:grid bg-white shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-12 bg-gray-50 border-b-1">
                      <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.no')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('sharedEnums.serviceType')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('sharedEnums.buildingType')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.address')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.acreage')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.floors')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.estimatePrice')}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceRequestManager.status')}
                      </th>
                      <th className="w-[120px] px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminServiceManager.action')}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-10 text-center align-middle"
                        >
                          <LoadingComponent />
                        </td>
                      </tr>
                    ) : serviceRequests && serviceRequests.length > 0 ? (
                      serviceRequests.map((item, idx) => {
                        const ui = serviceTypeStyle[item?.serviceType] || {
                          icon: 'fa-wrench',
                          lightBg: 'bg-gray-50',
                          textColor: 'text-gray-700',
                        };

                        const addressParts = [
                          item?.address?.district,
                          item?.address?.city,
                        ].filter(Boolean);
                        const addressText = addressParts.join(', ') || '—';

                        return (
                          <tr
                            key={item.serviceRequestID}
                            className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                              }`}
                          >
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                                {(currentPage - 1) * pageSize + idx + 1}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 ${ui.lightBg} rounded-md flex items-center justify-center`}
                                >
                                  <i
                                    className={`fa-solid ${ui.icon} ${ui.textColor}`}
                                  />
                                </div>
                                <span>
                                  {t(`Enums.ServiceType.${item.serviceType}`)}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-900">
                              {t(`Enums.BuildingType.${item.buildingType}`)}
                            </td>

                            <td
                              className="px-4 py-4 text-sm text-gray-600 truncate max-w-xs"
                              title={addressText}
                            >
                              {addressText}
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-900">
                              {item.floors > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold">
                                    {(
                                      item.length *
                                      item.width *
                                      item.floors
                                    ).toFixed(1)}{' '}
                                    m²
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {item.floors > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-1 text-gray-700 text-sm font-semibold">
                                    {item.floors}{' '}
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4 text-sm font-bold text-orange-500">
                              {item.estimatePrice == 0
                                ? t('contractorServiceRequestManager.negotiable')
                                : formatVND(Number(item.estimatePrice))}{' '}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge status={item.status} type="Request" />
                            </td>

                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/Admin/ServiceRequestManager/${item.serviceRequestID}`
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
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
                        <td colSpan="9" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center text-center mt-5 mb-5">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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

            {/* Service Request Cards */}
            <div className="block md:hidden p-4 space-y-3">
              {serviceRequests.map((item, idx) => {
                const ui = serviceTypeStyle[item?.serviceType] || {
                  icon: 'fa-wrench',
                  lightBg: 'bg-gray-50',
                  textColor: 'text-gray-700',
                  label: 'Dịch vụ'
                };

                const addressParts = [
                  item?.address?.district,
                  item?.address?.city,
                ].filter(Boolean);
                const addressText = addressParts.join(', ') || '—';

                const totalArea = item.floors > 0 ? (item.length * item.width * item.floors).toFixed(1) : 0;

                return (
                  <div
                    key={item.serviceRequestID}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </div>
                        <span className="text-gray-700 font-semibold text-sm">
                          {formatDate(item.createdAt, i18n.language)}
                        </span>
                      </div>
                      <StatusBadge status={item.status} type="Request" />
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Row 1: Service Type, Building Type, Address */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Service Type */}
                        <div className="text-center">
                          <div className={`w-9 h-9 ${ui.lightBg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                            <i className={`fa-solid ${ui.icon} ${ui.textColor}`} />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('sharedEnums.serviceType')}</span>
                          <span className="text-xs font-bold text-gray-900 block leading-tight">{t(`Enums.ServiceType.${item.serviceType}`)}</span>
                        </div>

                        {/* Building Type */}
                        <div className="text-center">
                          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                            <i className="fa-solid fa-building text-purple-600" />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('sharedEnums.buildingType')}</span>
                          <span className="text-xs font-bold text-gray-900 block leading-tight">
                            {t(`Enums.BuildingType.${item.buildingType}`)}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="text-center">
                          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                            <i className="fa-solid fa-location-dot text-red-600" />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('adminServiceRequestManager.address')}</span>
                          <span className="text-xs font-bold text-gray-900 block leading-tight truncate" title={addressText}>
                            {addressText}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Acreage, Floors, Price */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                        {/* Acreage */}
                        <div className="text-center">
                          <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                            <i className="fa-solid fa-ruler-combined text-teal-600" />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('adminServiceRequestManager.acreage')}</span>
                          <span className="text-xs font-bold text-gray-900 block leading-tight">
                            {totalArea} m²
                          </span>
                        </div>

                        {/* Floors */}
                        <div className="text-center">
                          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                            <i className="fa-solid fa-layer-group text-indigo-600" />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('adminServiceRequestManager.floors')}</span>
                          <span className="text-xs font-bold text-gray-900 block leading-tight">
                            {item.floors}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-center">
                          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                            <i className="fa-solid fa-money-bill-wave text-green-600" />
                          </div>
                          <span className="text-xs text-gray-500 block mb-0.5">{t('adminServiceRequestManager.estimatePrice')}</span>
                          <span className="text-xs font-bold text-green-600 block leading-tight">
                            {item.estimatePrice == 0
                              ? t('contractorServiceRequestManager.negotiable')
                              : formatVND(Number(item.estimatePrice))}{' '}
                          </span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/Admin/ServiceRequestManager/${item.serviceRequestID}`
                          )
                        }
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 active:bg-orange-800 transition-colors shadow-sm"
                      >
                        <i className="fa-solid fa-eye" />
                        {t('BUTTON.View')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalServiceRequests > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>
                {totalServiceRequests}{' '}
                {t('adminServiceRequestManager.serviceRequests')}
              </span>
            </div>
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
  );
}

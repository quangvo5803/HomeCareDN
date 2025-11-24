import { useServiceRequest } from '../../hook/useServiceRequest';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import { formatVND, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../hook/useAuth';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
export default function ContractorServiceRequestManager() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [sortOption, setSortOption] = useState('');
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);
  const navigate = useNavigate();

  const {
    fetchServiceRequests,
    setServiceRequests,
    setTotalServiceRequests,
    totalServiceRequests,
    loading,
    serviceRequests,
  } = useServiceRequest();

  //Realtime
  useRealtime({
    [RealtimeEvents.ServiceRequestCreated]: (payload) => {
      setServiceRequests((prev) => {
        if (prev.some((r) => r.serviceRequestID === payload.serviceRequestID)) {
          return prev; // tránh duplicate
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
    [RealtimeEvents.ServiceRequestClosed]: (payload) => {
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

    // 🔸 Khi trạng thái thanh toán thay đổi (Contractor đã thanh toán)
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
    // chỉ fetch khi có user
    if (user?.role === 'Contractor') {
      fetchServiceRequests({
        PageNumber: currentPage,
        PageSize: pageSize,
        FilterID: showAppliedOnly ? user.id : undefined,
        SortBy: sortOption,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, showAppliedOnly, sortOption]);

  const serviceTypeStyle = {
    Construction: {
      icon: 'fa-hammer',
      tint: 'text-orange-600',
      bg: 'bg-orange-50',
      ring: 'ring-orange-200',
      accent: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
    Repair: {
      icon: 'fa-screwdriver-wrench',
      tint: 'text-orange-600',
      bg: 'bg-orange-50',
      ring: 'ring-orange-200',
      accent: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  };
  const handleFilterChange = (checked) => {
    setShowAppliedOnly(checked);
    setCurrentPage(1);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header - Improved */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-blue-500/25">
              <i className="text-xl text-white fa-solid fa-list-alt" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t('contractorServiceRequestManager.title')}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {t('contractorServiceRequestManager.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Container - Enhanced Shadow & Border */}
        <div className="overflow-hidden bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100">
          {/* Actions Bar - Refined */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center flex-wrap gap-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm bg-white shadow-sm border border-gray-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex w-full h-full bg-blue-400 rounded-full opacity-75 animate-ping"></span>
                  <span className="relative inline-flex w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                </span>
                <span className="font-semibold text-gray-800">
                  {totalServiceRequests || 0}
                </span>
                <span className="text-gray-500">
                  {t('contractorServiceRequestManager.serviceRequests')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-orange-300 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showAppliedOnly}
                  onChange={(e) => handleFilterChange(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-white border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-orange-500"></i>
                  {t('contractorServiceRequestManager.showAppliedOnly') ||
                    'Đã ứng tuyển'}
                </span>
              </label>
              <select
                id="status-filter"
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white shadow-sm hover:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                aria-label="Sort service requests"
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
            {/* Desktop - Enhanced Cards */}
            <div className="hidden lg:block">
              <div className="p-6 space-y-4">
                {serviceRequests && serviceRequests.length > 0 ? (
                  serviceRequests.map((request) => {
                    const ui = serviceTypeStyle[request?.serviceType] || {
                      icon: 'fa-wrench',
                      tint: 'text-gray-600',
                      bg: 'bg-gray-50',
                      ring: 'ring-gray-200',
                      accent: 'bg-gradient-to-br from-gray-400 to-gray-500',
                    };
                    const addressParts = [
                      request?.address?.district,
                      request?.address?.city,
                    ].filter(Boolean);
                    const addressText = addressParts.join(', ') || '—';
                    return (
                      <div
                        key={request.serviceRequestID}
                        className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-orange-200"
                      >
                        {/* Left gradient accent bar */}
                        <div
                          className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl ${ui.accent} transition-all duration-300 group-hover:w-2`}
                        />

                        {/* Header row */}
                        <div className="flex justify-between items-start mb-5 pl-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${ui.bg} ring-2 ${ui.ring} transition-transform duration-300 group-hover:scale-110`}
                              >
                                <i
                                  className={`fa-solid ${ui.icon} ${ui.tint} text-lg`}
                                />
                              </span>
                              <h3 className="text-xl font-bold text-gray-900">
                                {t(`Enums.ServiceType.${request.serviceType}`)}
                              </h3>
                            </div>

                            {/* Location */}
                            <div className="flex items-center text-sm text-gray-600 gap-2 ml-0.5">
                              <i className="fa-solid fa-location-dot text-orange-500" />
                              <span
                                className="truncate max-w-[56rem] font-medium"
                                title={addressText}
                              >
                                {addressText}
                              </span>
                            </div>
                          </div>

                          <StatusBadge status={request.status} type="Request" />
                        </div>

                        {/* Meta chips - Improved */}
                        <div className="pl-4 mb-5 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                            <i className="fa-solid fa-box-open" />
                            {t(`Enums.PackageOption.${request.packageOption}`)}
                          </span>
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200">
                            <i className="fa-solid fa-building" />
                            {t(`Enums.BuildingType.${request.buildingType}`)}
                          </span>
                          {(request?.floors ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200">
                              <i className="fa-solid fa-layer-group" />
                              {request.floors}{' '}
                              {t('contractorServiceRequestDetail.floorsUnit')}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200">
                            <i className="fa-solid fa-ruler-combined" />
                            {(
                              request.length *
                              request.width *
                              request.floors
                            ).toFixed(1) || '—'}{' '}
                            m²
                          </span>
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200">
                            <i className="fa-solid fa-coins" />
                            {request.estimatePrice
                              ? formatVND(request.estimatePrice)
                              : t('contractorServiceRequestManager.negotiable')}
                          </span>
                        </div>

                        {/* Footer row - Enhanced */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 pl-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <i className="fa-regular fa-calendar text-gray-400"></i>
                            <span className="font-medium">
                              {formatDate(request.createdAt, i18n.language)}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/Contractor/ServiceRequestManager/${request.serviceRequestID}`
                              )
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <i className="fa-solid fa-eye" />
                            {t('BUTTON.View')}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <i className="text-3xl text-gray-400 fa-solid fa-list-alt"></i>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
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

            {/* Mobile - Enhanced */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {serviceRequests && serviceRequests.length > 0 ? (
                  serviceRequests.map((request) => {
                    const ui = serviceTypeStyle[request?.serviceType] || {
                      icon: 'fa-wrench',
                      tint: 'text-gray-600',
                      bg: 'bg-gray-50',
                      accent: 'bg-gray-400',
                    };
                    const addressParts = [
                      request?.address?.provined,
                      request?.address?.district,
                      request?.address?.city,
                    ].filter(Boolean);
                    const addressText = addressParts.join(', ') || '—';

                    return (
                      <div
                        key={request.serviceRequestID}
                        className="relative p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-200"
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${ui.accent}`}
                        />

                        <div className="flex justify-between items-start mb-3 mt-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${ui.bg}`}
                              >
                                <i
                                  className={`fa-solid ${ui.icon} ${ui.tint}`}
                                />
                              </span>
                              <h3 className="text-sm font-bold text-gray-900">
                                {t(`Enums.ServiceType.${request.serviceType}`)}
                              </h3>
                            </div>

                            <div className="flex items-center text-xs text-gray-600 gap-1.5">
                              <i className="fa-solid fa-location-dot text-orange-500" />
                              <span
                                className="truncate font-medium"
                                title={addressText}
                              >
                                {addressText}
                              </span>
                            </div>
                          </div>

                          <StatusBadge status={request.status} type="Request" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                            <i className="fa-solid fa-building" />
                            {t(`Enums.BuildingType.${request.buildingType}`)}
                          </span>
                          {(request?.floors ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-medium">
                              <i className="fa-solid fa-layer-group" />
                              {request.floors}{' '}
                              {t('contractorServiceRequestDetail.floorsUnit')}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                            <i className="fa-solid fa-ruler-combined" />
                            {request.area || '—'} m²
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <div className="text-xs font-bold text-orange-600 inline-flex items-center gap-1.5">
                            <i className="fa-solid fa-coins" />
                            {request.estimatePrice
                              ? formatVND(request.estimatePrice)
                              : t('contractorServiceRequestManager.negotiable')}
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/Contractor/ServiceRequestManager/${request.serviceRequestID}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm shadow-blue-500/25 hover:shadow-md transition-all"
                          >
                            <i className="fa-solid fa-eye" />
                            {t('BUTTON.View')}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <i className="text-2xl text-gray-400 fa-solid fa-list-alt"></i>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900">
                      {t('contractorServiceRequestManager.noRequest')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('contractorServiceRequestManager.letStart')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalServiceRequests > 0 && (
              <div className="flex justify-center py-6 border-t border-gray-100 bg-gray-50/50">
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import { formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../hook/useAuth';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import Loading from '../../components/Loading';

export default function MaterialRequestManager() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [sortOption, setSortOption] = useState('');
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);

  const navigate = useNavigate();

  const {
    fetchMaterialRequests,
    setMaterialRequests,
    setTotalMaterialRequests,
    totalMaterialRequests,
    loading,
    materialRequests,
  } = useMaterialRequest();

  //Realtime
  useRealtime({
    [RealtimeEvents.MaterialRequestCreated]: (payload) => {
      setMaterialRequests((prev) => {
        if (
          prev.some((r) => r.materialRequestID === payload.materialRequestID)
        ) {
          return prev; // tránh duplicate
        }
        return [payload, ...prev];
      });
      setTotalMaterialRequests((prev) => prev + 1);
    },
    [RealtimeEvents.MaterialRequestDelete]: (payload) => {
      setMaterialRequests((prev) =>
        prev.filter((r) => r.materialRequestID !== payload.materialRequestID)
      );
      setTotalMaterialRequests((prev) => Math.max(0, prev - 1));
    },
    [RealtimeEvents.MaterialRequestClosedClosed]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === payload.materialRequestID
            ? {
                ...mr,
                status: 'Closed',
              }
            : mr
        )
      );
    },

    [RealtimeEvents.DistributorApplicationCreated]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === payload.materialRequestID
            ? {
                ...mr,
                distributorApplyCount: (mr.distributorApplyCount || 0) + 1,
              }
            : mr
        )
      );
    },
    [RealtimeEvents.DistributorApplicationAccept]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === payload.materialRequestID
            ? {
                ...mr,
                status: 'Closed',
              }
            : mr
        )
      );
    },
    [RealtimeEvents.DistributorApplicationDelete]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === payload.materialRequestID
            ? {
                ...mr,
                distributorApplyCount: Math.max(
                  0,
                  (mr.distributorApplyCount || 1) - 1
                ),
              }
            : mr
        )
      );
    },

    // 🔸 Khi trạng thái thanh toán thay đổi (Contractor đã thanh toán)
    [RealtimeEvents.PaymentTransactionUpdated]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === payload.materialRequestID
            ? {
                ...mr,
                status: 'Closed',
              }
            : mr
        )
      );
    },
  });

  useEffect(() => {
    if (user?.role === 'Distributor') {
      fetchMaterialRequests({
        PageNumber: currentPage,
        PageSize: pageSize,
        FilterID: showAppliedOnly ? user.id : undefined,
        SortBy: sortOption,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, showAppliedOnly, sortOption]);

  const handleFilterChange = (checked) => {
    setShowAppliedOnly(checked);
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl shadow-md">
            <i className="fa-solid fa-box-open text-white text-xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {t('distributorMaterialRequest.title')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('distributorMaterialRequest.subtitle')}
            </p>
          </div>
        </div>

        {/* Container */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Actions Bar - Refined */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center flex-wrap gap-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm bg-white shadow-sm border border-gray-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex w-full h-full bg-blue-400 rounded-full opacity-75 animate-ping"></span>
                  <span className="relative inline-flex w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                </span>
                <span className="font-semibold text-gray-800">
                  {totalMaterialRequests || 0}
                </span>
                <span className="text-gray-500">
                  {t('distributorMaterialRequest.materialRequests')}
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
                  {t('distributorMaterialRequest.appliedOnly') ||
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
          <div className="p-6 space-y-5">
            {materialRequests && materialRequests.length > 0 ? (
              materialRequests.map((req) => {
                const addressParts = [
                  req?.address?.district,
                  req?.address?.city,
                ].filter(Boolean);
                const addressText = addressParts.join(', ') || '—';
                return (
                  <div
                    key={req.materialRequestID}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
                  >
                    {/* Left Accent */}
                    <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-orange-500" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pl-4">
                      {/* LEFT GROUP */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                          <i className="fas fa-boxes text-orange-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-600 mt-1">
                          {t('Enums.ServiceType.Material')} #
                          {req.materialRequestID.substring(0, 8)}
                        </h3>
                      </div>

                      {/* RIGHT BADGE */}
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} type="Request" />
                        {req.selectedDistributorApplicationID &&
                          (req.selectedDistributorApplicationID === user.id ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              <i className="fa-solid fa-user-check"></i>
                              Bạn là người được chọn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <i className="fa-solid fa-user-check"></i>
                              Đã chọn nhà thầu
                            </span>
                          ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg mb-4 pl-4">
                      <i className="fa-solid fa-location-dot text-orange-500 mr-2" />
                      {addressText}
                    </p>
                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-4 pl-4">
                      {req.description.length > 60
                        ? req.description.substring(0, 60) + '...'
                        : req.description}
                    </p>

                    {/* Info chips */}
                    <div className="flex flex-wrap gap-2 mb-5 pl-4 text-sm">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        <i className="fa-solid fa-cubes" />
                        {req.materialRequestItems?.length || 0}{' '}
                        {t('distributorMaterialRequest.materialType')}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                        <i className="fa-regular fa-calendar" />
                        {t('userPage.materialRequestDetail.deliveryDate')}
                        {': '}
                        {formatDate(req.deliveryDate, i18n.language)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 px-4">
                      {/* Left side */}
                      <div className="flex items-center gap-3">
                        {/* canAddMaterial */}
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border 
                                                        ${
                                                          req.canAddMaterial
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                        >
                          <i
                            className={`fa-solid ${
                              req.canAddMaterial ? 'fa-check' : 'fa-xmark'
                            }`}
                          />
                          {req.canAddMaterial
                            ? t('distributorMaterialRequest.canAddMaterial')
                            : t('distributorMaterialRequest.noAddMaterial')}
                        </span>
                      </div>

                      {/* Right side buttons */}
                      <button
                        onClick={() =>
                          navigate(
                            `/Distributor/MaterialRequestManager/${req.materialRequestID}`
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 cursor-pointer"
                      >
                        <i className="fa-solid fa-eye" />
                        {t('BUTTON.View')}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-gray-500">
                <i className="fa-solid fa-box-open text-4xl text-gray-400 mb-4"></i>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  {t('distributorMaterialRequest.noRequest')}
                </p>
                <p>{t('distributorMaterialRequest.letStart')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalMaterialRequests > 0 && (
            <div className="flex justify-center py-6 border-t border-gray-100 bg-gray-50/50">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalMaterialRequests}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

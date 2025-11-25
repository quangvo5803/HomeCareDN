import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useAuth } from '../../hook/useAuth';

export default function AdminMaterialRequestManager() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [sortOption, setSortOption] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchMaterialRequests,
    setMaterialRequests,
    setTotalMaterialRequests,
    totalMaterialRequests,
    loading,
    materialRequests,
  } = useMaterialRequest();

  useRealtime({
    [RealtimeEvents.MaterialRequestCreated]: (payload) => {
      setMaterialRequests((prev) => {
        if (
          prev.some((r) => r.materialRequestID === payload.materialRequestID)
        ) {
          return prev;
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
    [RealtimeEvents.DistributorApplicationAcceptApplicationAccept]: (
      payload
    ) => {
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
    fetchMaterialRequests({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortOption,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, sortOption]);

  const getAddressText = (address) => {
    if (!address) return '—';
    const addressParts = [
      address?.detail,
      address?.ward,
      address?.district,
      address?.city,
    ].filter(Boolean);
    return addressParts.join(', ') || '—';
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-boxes text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {t('adminMaterialRequestManager.title') ||
                    'Material Request Manager'}
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  {t('adminMaterialRequestManager.subtitle') ||
                    'Manage all material requests'}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-table mr-2" />
                {t('common.Table')}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'grid'
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
                    <i className="fa-solid fa-boxes text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {loading ? 0 : totalMaterialRequests || 0}
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      {t('adminMaterialRequestManager.materialRequests') ||
                        'Material Requests'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-5">
            {loading ? (
              <div className="col-span-full py-10 text-center">
                <LoadingComponent />
              </div>
            ) : materialRequests && materialRequests.length > 0 ? (
              materialRequests.map((item) => {
                const addressText = getAddressText(item?.address);

                return (
                  <div
                    key={item.materialRequestID}
                    className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300"
                  >
                    <div className="h-2 bg-orange-500"></div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center ring-2 ring-orange-300 transition-transform duration-300 group-hover:scale-110">
                            <i className="fa-solid fa-boxes text-orange-700 text-xl" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {t('Enums.ServiceType.Material')}
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

                      <div className="space-y-3 mb-4">
                        {/* Address */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-location-dot text-orange-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('adminMaterialRequestManager.address') ||
                                'Address'}
                            </div>
                            <div
                              className="text-sm font-semibold text-gray-900 line-clamp-2 break-words max-w-full"
                              title={addressText}
                            >
                              {addressText}
                            </div>
                          </div>
                        </div>

                        {/* Material Items Count */}
                        {item.materialRequestItems &&
                          item.materialRequestItems.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-cube text-amber-600 text-sm" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 font-medium">
                                  {t('adminMaterialRequestManager.materials') ||
                                    'Materials'}
                                </div>
                                <div className="text-base font-bold text-orange-500">
                                  {item.materialRequestItems.length}{' '}
                                  {t('adminMaterialRequestManager.items') ||
                                    'items'}
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Distributor Applications */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-handshake text-green-600 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {t('adminMaterialRequestManager.distributors') ||
                                'Applications'}
                            </div>
                            <div className="text-base font-bold text-green-500">
                              {item.distributorApplyCount || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/Admin/MaterialRequestManager/${item.materialRequestID}`
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md cursor-pointer"
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
                      <i className="fa-solid fa-boxes text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('adminMaterialRequestManager.empty') ||
                        'No Material Requests'}
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      {t('adminMaterialRequestManager.empty_description') ||
                        'No material requests found'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Table View
          <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="h-12 bg-gray-50 border-b-1">
                    <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.no')}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.address')}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.materials')}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.distributors')}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.status')}
                    </th>
                    <th className="w-[120px] px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('adminMaterialRequestManager.action')}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-10 text-center align-middle"
                      >
                        <LoadingComponent />
                      </td>
                    </tr>
                  ) : materialRequests && materialRequests.length > 0 ? (
                    materialRequests.map((item, idx) => {
                      const addressText = getAddressText(item?.address);

                      return (
                        <tr
                          key={item.materialRequestID}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </span>
                          </td>

                          <td
                            className="px-4 py-4 text-sm text-gray-600 truncate max-w-xs"
                            title={addressText}
                          >
                            {addressText}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.materialRequestItems?.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">
                                  {item.materialRequestItems.length}{' '}
                                  {t('adminMaterialRequestManager.items')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm font-bold text-green-500">
                            {item.distributorApplyCount || 0}
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={item.status} type="Request" />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/Admin/MaterialRequestManager/${item.materialRequestID}`
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
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
                      <td colSpan="8" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center text-center mt-5 mb-5">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i className="fa-solid fa-boxes text-gray-400 text-3xl" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {t('adminMaterialRequestManager.empty') ||
                              'No Material Requests'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t(
                              'adminMaterialRequestManager.empty_description'
                            ) || 'No material requests found'}
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
        {!loading && totalMaterialRequests > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span>
                {totalMaterialRequests}{' '}
                {t('adminMaterialRequestManager.materialRequests') ||
                  'Material Requests'}
              </span>
            </div>
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
  );
}

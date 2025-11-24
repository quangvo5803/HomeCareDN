import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { distributorApplicationService } from '../../services/distributorApplicationService';
import { formatVND, formatDate } from '../../utils/formatters';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { Pagination } from 'antd';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import he from 'he';
import Avatar from 'react-avatar';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';

export default function AdminMaterialRequestDetail() {
  const { materialRequestId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const distributorDetailRef = useRef(null);

  const { setMaterialRequests, getMaterialRequestById } = useMaterialRequest();

  const [materialRequestDetail, setMaterialRequestDetail] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorApplicationList, setDistributorApplicationList] = useState(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const [viewingDistributorDetail, setViewingDistributorDetail] =
    useState(false);

  useRealtime({
    [RealtimeEvents.DistributorApplicationCreated]: (payload) => {
      if (materialRequestId == payload.materialRequestID) {
        setDistributorApplicationList((prev) => {
          if (
            prev.some(
              (r) =>
                r.distributorApplicationID === payload.distributorApplicationID
            )
          ) {
            return prev;
          }
          return [payload, ...prev];
        });
        setTotalCount((prev) => prev + 1);
      }
    },

    [RealtimeEvents.DistributorApplicationDelete]: (payload) => {
      if (materialRequestId == payload.materialRequestID) {
        setDistributorApplicationList((prev) =>
          prev.filter(
            (da) =>
              da.distributorApplicationID !== payload.distributorApplicationID
          )
        );

        if (
          selectedDistributor?.distributorApplicationID ===
          payload.distributorApplicationID
        ) {
          setSelectedDistributor(null);
          setViewingDistributorDetail(false);
        }

        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    },
  });

  useEffect(() => {
    if (materialRequestDetail) {
      setMaterialRequests((prev) =>
        prev.map((mr) =>
          mr.materialRequestID === materialRequestId
            ? materialRequestDetail
            : mr
        )
      );
    }
  }, [materialRequestDetail, materialRequestId, setMaterialRequests]);

  useEffect(() => {
    if (!materialRequestId) return;

    const fetchData = async () => {
      try {
        const result = await getMaterialRequestById(materialRequestId);
        if (result) {
          setMaterialRequestDetail(result);
          if (result.selectedDistributorApplication) {
            setSelectedDistributor(result.selectedDistributorApplication);
            setViewingDistributorDetail(true);
          }
        }
      } catch (err) {
        toast.error(t(handleApiError(err)));
      }
    };

    fetchData();
  }, [materialRequestId, getMaterialRequestById, t]);

  const fetchDistributors = useCallback(async () => {
    try {
      const res = await distributorApplicationService.getAllForAdmin({
        PageNumber: currentPage,
        PageSize: pageSize,
        FilterID: materialRequestId,
      });

      setDistributorApplicationList(res.items || []);
      setTotalCount(res.totalCount || 0);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  }, [materialRequestId, currentPage, t]);

  useEffect(() => {
    if (materialRequestDetail) {
      fetchDistributors();
    }
  }, [materialRequestDetail, fetchDistributors]);

  const handleSelectDistributor = async (distributorApplicationID) => {
    try {
      const fullDistributor =
        await distributorApplicationService.getByIdForAdmin(
          distributorApplicationID
        );
      setSelectedDistributor(fullDistributor);
      setViewingDistributorDetail(true);

      setTimeout(() => {
        distributorDetailRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  const handleBackToList = () => {
    setViewingDistributorDetail(false);
  };

  useEffect(() => {
    if (materialRequestDetail || selectedDistributor) {
      const vb = new VenoBox({ selector: '.venobox' });
      return () => vb.close();
    }
  }, [materialRequestDetail, selectedDistributor]);

  const loading = !materialRequestDetail;

  if (loading) return <Loading />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center backdrop-blur-sm cursor-pointer"
              onClick={() => navigate('/Admin/MaterialRequestManager')}
            >
              <i className="fas fa-arrow-left text-white"></i>
            </button>

            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i className="fas fa-boxes text-2xl text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {t('Enums.ServiceType.Material')}
              </h1>
              <div className="flex items-center gap-4 text-white/90 text-sm mt-1">
                <span className="flex items-center gap-1.5">
                  <i className="far fa-calendar"></i>
                  {formatDate(materialRequestDetail.createdAt, i18n.language)}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-hashtag"></i>
                  {materialRequestDetail.materialRequestID.substring(0, 8)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Customer Information Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <i className="fa-solid fa-user-tie text-orange-500"></i>
            {t('adminMaterialRequestManager.customerInfo') ||
              'Thông tin khách hàng'}
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Customer Name */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-circle-user text-blue-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  {t('adminMaterialRequestManager.customerName') ||
                    'Tên khách hàng'}
                </p>
                <p className="font-semibold text-gray-800">
                  {materialRequestDetail.customerName || 'N/A'}
                </p>
              </div>
            </div>

            {/* Customer Email */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-envelope text-green-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  {t('adminMaterialRequestManager.customerEmail') ||
                    'Email khách hàng'}
                </p>
                <p className="font-semibold text-gray-800 break-all">
                  {materialRequestDetail.customerEmail || 'N/A'}
                </p>
              </div>
            </div>

            {/* Customer Phone */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-phone text-purple-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  {t('adminMaterialRequestManager.customerPhone') ||
                    'Số điện thoại'}
                </p>
                <p className="font-semibold text-gray-800">
                  {materialRequestDetail.customerPhone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Material Request Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {t('adminMaterialRequestManager.description')}
            </p>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: materialRequestDetail.description,
              }}
            ></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-location-dot text-orange-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('adminMaterialRequestManager.address')}
                </p>
                <p className="font-semibold text-gray-800">
                  {materialRequestDetail.address
                    ? `${materialRequestDetail.address.detail}, ${materialRequestDetail.address.ward}, ${materialRequestDetail.address.district}, ${materialRequestDetail.address.city}`
                    : t('sharedEnums.updating')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-cube text-purple-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('adminMaterialRequestManager.materials')}
                </p>
                <p className="font-semibold text-gray-800">
                  {materialRequestDetail.materialRequestItems?.length || 0}{' '}
                  {t('adminMaterialRequestManager.items')}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-end">
              <StatusBadge
                status={materialRequestDetail.status}
                type="Request"
              />
            </div>
          </div>

          {/* Material Items List */}
          {materialRequestDetail.materialRequestItems &&
            materialRequestDetail.materialRequestItems.length > 0 && (
              <div className="mt-6">
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  {t('adminMaterialRequestManager.materialsList')}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          {t('adminMaterialRequestManager.no')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          {t('adminMaterialRequestManager.materialName')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          {t('adminMaterialRequestManager.quantity')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          {t('adminMaterialRequestManager.unit')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {materialRequestDetail.materialRequestItems.map(
                        (item, idx) => (
                          <tr
                            key={item.materialRequestItemID}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {i18n.language === 'vi'
                                ? item.material?.name
                                : item.material?.nameEN || item.material?.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                              {i18n.language === 'vi'
                                ? item.material?.unit
                                : item.material?.unitEn || item.material?.unit}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>

        {/* Distributor Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-800">
              {viewingDistributorDetail && selectedDistributor
                ? t('adminMaterialRequestManager.distributorDetail.title')
                : t('adminMaterialRequestManager.listDistributors')}
            </h3>
            {!viewingDistributorDetail && (
              <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium">
                {totalCount || 0}{' '}
                {t('adminMaterialRequestManager.totalDistributors')}
              </span>
            )}
          </div>

          {viewingDistributorDetail && selectedDistributor ? (
            <>
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 font-medium cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
                <span>{t('BUTTON.Back')}</span>
              </button>

              <div ref={distributorDetailRef}>
                <div>
                  <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-orange-100 flex-shrink-0">
                        <Avatar
                          name={selectedDistributor?.distributorName || 'User'}
                          round={false}
                          size="80"
                          color="#3b82f6"
                          fgColor="#fff"
                          textSizeRatio={2.5}
                          className="!w-full !h-full !object-cover !rounded-2xl !flex !items-center !justify-center !text-3xl !font-bold"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-2">
                          {selectedDistributor.distributorName}
                        </h4>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mb-1">
                          <i className="fa-solid fa-envelope text-orange-500"></i>
                          {selectedDistributor.distributorEmail}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <i className="fa-solid fa-phone text-orange-500"></i>
                          {selectedDistributor.distributorPhone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={selectedDistributor.status}
                      type="Application"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-emerald-600 text-sm font-medium mb-1">
                        {t(
                          'adminMaterialRequestManager.distributorDetail.totalPrice'
                        )}
                      </p>
                      <p className="font-bold text-lg text-emerald-700">
                        {formatVND(selectedDistributor.totalEstimatePrice)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-cyan-50 p-4 rounded-2xl border border-orange-100">
                      <p className="text-orange-600 text-sm font-medium mb-1">
                        {t(
                          'adminMaterialRequestManager.distributorDetail.completedProject'
                        )}
                      </p>
                      <p className="font-bold text-lg text-orange-700">
                        {selectedDistributor.completedProjectCount ?? 0}{' '}
                        {t(
                          'adminMaterialRequestManager.distributorDetail.project'
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-amber-600 text-sm font-medium mb-1">
                        {t(
                          'adminMaterialRequestManager.distributorDetail.rating'
                        )}
                      </p>
                      <p className="font-bold text-lg text-amber-700 flex items-center gap-1">
                        <i className="fa-solid fa-star"></i>
                        {selectedDistributor.averageRating.toFixed(1)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-purple-600 text-sm font-medium mb-1">
                        {t(
                          'adminMaterialRequestManager.distributorDetail.createAt'
                        )}
                      </p>
                      <p className="font-bold text-lg text-purple-700">
                        {formatDate(
                          selectedDistributor.createdAt,
                          i18n.language
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                    <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">
                      {t('adminMaterialRequestManager.description')}
                    </p>
                    <div
                      className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                      dangerouslySetInnerHTML={{
                        __html: he.decode(selectedDistributor.message || ''),
                      }}
                    />
                  </div>

                  {selectedDistributor.items &&
                    selectedDistributor.items.length > 0 && (
                      <div className="bg-gradient-to-br from-indigo-50 to-orange-50 p-5 rounded-2xl border border-indigo-100 mb-6">
                        <p className="text-indigo-600 text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                          <i className="fa-solid fa-list"></i>
                          {t(
                            'adminMaterialRequestManager.distributorDetail.quotedItems'
                          )}
                        </p>

                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-100 to-orange-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                  {t('adminMaterialRequestManager.no')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                  {t(
                                    'adminMaterialRequestManager.materialName'
                                  )}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                  {t('adminMaterialRequestManager.quantity')}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                  {t('adminMaterialRequestManager.unit')}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                  {t(
                                    'adminMaterialRequestManager.distributorDetail.price'
                                  )}
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                              {selectedDistributor.items.map((item, idx) => (
                                <tr
                                  key={item.distributorApplicationItemID}
                                  className="hover:bg-indigo-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {idx + 1}
                                  </td>

                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {i18n.language === 'vi'
                                      ? item.material?.name
                                      : item.material?.nameEN ||
                                        item.material?.name}
                                  </td>

                                  <td className="px-4 py-3 text-sm text-gray-700 text-center font-semibold">
                                    {item.quantity}
                                  </td>

                                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                    {i18n.language === 'vi'
                                      ? item.material?.unit
                                      : item.material?.unitEn ||
                                        item.material?.unit}
                                  </td>

                                  <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">
                                    {formatVND(item.price)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          ) : distributorApplicationList.length === 0 ? (
            <div className="flex flex-col items-center mt-5 mb-5">
              <i className="text-4xl mb-2 mt-2 fa-solid fa-boxes"></i>
              <h3 className="mb-1 text-lg font-medium text-gray-900">
                {t('adminMaterialRequestManager.noDistributor')}
              </h3>
              <p className="text-gray-500">
                {t('adminMaterialRequestManager.noDistributorYet')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {distributorApplicationList.map((item) => (
                <button
                  key={item.distributorApplicationID}
                  onClick={() =>
                    handleSelectDistributor(item.distributorApplicationID)
                  }
                  className="w-full text-left p-4 border rounded-xl transition-all duration-200 cursor-pointer group bg-white border-gray-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-orange-400">
                        <Avatar
                          name={item?.distributorEmail || 'User'}
                          round
                          size="48"
                          color="#3B82F6"
                          fgColor="#FFFFFF"
                          className="!w-full !h-full !rounded-full !object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-orange-500">
                          {item.distributorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.distributorEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {t(
                            'adminMaterialRequestManager.distributorDetail.totalPrice'
                          )}
                        </p>
                        <p className="font-bold text-emerald-600">
                          {formatVND(item.totalEstimatePrice)}
                        </p>
                      </div>
                      <span className="text-orange-500 font-medium">
                        {t('adminMaterialRequestManager.viewProfile')}{' '}
                        <i className="fa-solid fa-arrow-right ms-1"></i>
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {totalCount > pageSize && (
                <div className="flex justify-center pt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalCount}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

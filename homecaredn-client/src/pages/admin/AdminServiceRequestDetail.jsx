import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { contractorApplicationService } from '../../services/contractorApplicationService';
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
import CommissionCountdown from '../../components/partner/CommissionCountdown';

export default function AdminServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const contractorDetailRef = useRef(null);

  const { setServiceRequests, getServiceRequestById } = useServiceRequest();

  const [serviceRequestDetail, setServiceRequestDetail] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [contractorApplicationList, setContractorApplicationList] = useState(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  // Track if we're viewing contractor detail (user can toggle back to list)
  const [viewingContractorDetail, setViewingContractorDetail] = useState(false);

  // Realtime updates
  useRealtime({
    [RealtimeEvents.ContractorApplicationCreated]: (payload) => {
      if (serviceRequestId == payload.serviceRequestID) {
        setContractorApplicationList((prev) => {
          if (
            prev.some(
              (r) =>
                r.contractorApplicationID === payload.contractorApplicationID
            )
          ) {
            return prev;
          }
          return [payload, ...prev];
        });
        setTotalCount((prev) => prev + 1);
      }
    },

    [RealtimeEvents.ContractorApplicationDelete]: (payload) => {
      if (serviceRequestId == payload.serviceRequestID) {
        setContractorApplicationList((prev) =>
          prev.filter(
            (ca) =>
              ca.contractorApplicationID !== payload.contractorApplicationID
          )
        );

        // Clear selected contractor if it was deleted
        if (
          selectedContractor?.contractorApplicationID ===
          payload.contractorApplicationID
        ) {
          setSelectedContractor(null);
          setViewingContractorDetail(false);
        }

        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    },

    [RealtimeEvents.ContractorApplicationAccept]: (payload) => {
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? { ...sr, status: 'Closed' }
            : sr
        )
      );
      if (serviceRequestId == payload.serviceRequestID) {
        setServiceRequestDetail(
          (prev) => prev && { ...prev, status: 'Closed' }
        );
        setContractorApplicationList((prev) => {
          const newList = prev.map((ca) =>
            ca.contractorApplicationID === payload.contractorApplicationID
              ? {
                ...ca,
                status: 'PendingCommission',
                dueCommisionTime: payload?.dueCommisionTime || null,
              }
              : { ...ca, status: 'Rejected' }
          );

          const selected = newList.find(
            (ca) =>
              ca.contractorApplicationID === payload.contractorApplicationID
          );

          if (selected) {
            setSelectedContractor(selected);
            setViewingContractorDetail(true);
          }

          return newList;
        });
      }
    },

    [RealtimeEvents.ContractorApplicationRejected]: (payload) => {
      if (serviceRequestId == payload.serviceRequestID) {
        // Update contractor list
        setContractorApplicationList((prev) =>
          prev.map((ca) =>
            ca.contractorApplicationID === payload.contractorApplicationID
              ? { ...ca, status: 'Rejected' }
              : ca
          )
        );

        if (
          selectedContractor?.contractorApplicationID ===
          payload.contractorApplicationID
        ) {
          setSelectedContractor((prev) => ({
            ...prev,
            status: 'Rejected',
          }));
        }
      }
    },

    [RealtimeEvents.PaymentTransactionUpdated]: (payload) => {
      if (
        payload.contractorApplicationID ===
        selectedContractor?.contractorApplicationID
      ) {
        setSelectedContractor((prev) => ({
          ...prev,
          status: 'Approved',
          dueCommisionTime: null,
        }));
      }
    },
  });

  // ===== FETCH SERVICE REQUEST DETAIL =====
  useEffect(() => {
    if (!serviceRequestId) return;

    const fetchData = async () => {
      try {
        const result = await getServiceRequestById(serviceRequestId);
        if (result) {
          setServiceRequestDetail(result);
          // Initialize selectedContractor from server data if exists
          if (result.selectedContractorApplication) {
            setSelectedContractor(result.selectedContractorApplication);
            setViewingContractorDetail(true);
          }
        }
      } catch (err) {
        toast.error(t(handleApiError(err)));
      }
    };

    fetchData();
  }, [serviceRequestId, getServiceRequestById, t]);

  // ===== FETCH CONTRACTOR LIST WITH PAGINATION =====
  const fetchContractors = useCallback(async () => {
    try {
      const res = await contractorApplicationService.getAllForAdmin({
        PageNumber: currentPage,
        PageSize: pageSize,
        FilterID: serviceRequestId,
      });

      setContractorApplicationList(res.items || []);
      setTotalCount(res.totalCount || 0);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  }, [serviceRequestId, currentPage, t]);

  useEffect(() => {
    if (serviceRequestDetail) {
      fetchContractors();
    }
  }, [serviceRequestDetail, fetchContractors]);

  // ===== HANDLE SELECT CONTRACTOR =====
  const handleSelectContractor = async (contractorApplicationID) => {
    try {
      const fullContractor = await contractorApplicationService.getByIdForAdmin(
        contractorApplicationID
      );
      setSelectedContractor(fullContractor);
      setViewingContractorDetail(true);

      setTimeout(() => {
        contractorDetailRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  // ===== HANDLE BACK TO LIST =====
  const handleBackToList = () => {
    setViewingContractorDetail(false);
  };

  // ===== INIT VENOBOX =====
  useEffect(() => {
    if (serviceRequestDetail || selectedContractor) {
      const vb = new VenoBox({ selector: '.venobox' });
      return () => vb.close();
    }
  }, [serviceRequestDetail, selectedContractor]);

  const loading = !serviceRequestDetail;

  if (loading) return <Loading />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center backdrop-blur-sm cursor-pointer"
              onClick={() => navigate('/Admin/ServiceRequestManager')}
            >
              <i className="fas fa-arrow-left text-white"></i>
            </button>

            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i
                className={`fas ${serviceRequestDetail?.serviceType === 'Construction'
                  ? 'fa-hammer'
                  : 'fa-screwdriver-wrench'
                  } text-2xl text-white`}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {t(`Enums.ServiceType.${serviceRequestDetail.serviceType}`)}
              </h1>
              <div className="flex items-center gap-4 text-white/90 text-sm mt-1">
                <span className="flex items-center gap-1.5">
                  <i className="far fa-calendar"></i>
                  {new Date(serviceRequestDetail.createdAt).toLocaleDateString(
                    'vi-VN'
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-hashtag"></i>
                  {serviceRequestDetail.serviceRequestID.substring(0, 8)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Service Request Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {t('adminServiceRequestManager.description')}
            </p>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: serviceRequestDetail.description,
              }}
            ></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-star text-orange-500"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('sharedEnums.packageOption')}
                </p>
                <p className="font-semibold text-gray-800">
                  {serviceRequestDetail.packageOption
                    ? t(
                      `Enums.PackageOption.${serviceRequestDetail.packageOption}`
                    )
                    : t(`sharedEnums.updating`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-blue-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('sharedEnums.buildingType')}
                </p>
                <p className="font-semibold text-gray-800">
                  {t(`Enums.BuildingType.${serviceRequestDetail.buildingType}`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-building-columns text-red-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('sharedEnums.mainStructure')}
                </p>
                <p className="font-semibold text-gray-800">
                  {serviceRequestDetail.mainStructureType
                    ? t(
                      `Enums.MainStructure.${serviceRequestDetail.mainStructureType}`
                    )
                    : t(`sharedEnums.updating`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-palette text-pink-500"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('sharedEnums.designStyle')}
                </p>
                <p className="font-semibold text-gray-800">
                  {serviceRequestDetail.designStyle
                    ? t(`Enums.DesignStyle.${serviceRequestDetail.designStyle}`)
                    : t(`sharedEnums.updating`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-ruler text-green-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('adminServiceRequestManager.acreage')}
                </p>
                <p className="font-semibold text-gray-800">
                  {serviceRequestDetail.width}m × {serviceRequestDetail.length}m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-layer-group text-purple-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t('adminServiceRequestManager.numberOfFloors')}
                </p>
                <p className="font-semibold text-gray-800">
                  {serviceRequestDetail.floors}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Address */}
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-red-500 mt-1"></i>
                <div>
                  <p className="text-sm text-gray-500">
                    {t('adminServiceRequestManager.address')}
                  </p>
                  <p className="font-medium">
                    {serviceRequestDetail.address.detail},{' '}
                    {serviceRequestDetail.address.ward},{' '}
                    {serviceRequestDetail.address.district},{' '}
                    {serviceRequestDetail.address.city}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start justify-end gap-3">
                <i className="fas fa-money-bill-wave text-emerald-500 mt-1"></i>
                <div>
                  <p className="text-sm text-gray-500">
                    {t('adminServiceRequestManager.estimatePrice')}
                  </p>
                  <p className="font-semibold text-emerald-600 text-lg">
                    {formatVND(Number(serviceRequestDetail.estimatePrice))}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-end">
                <StatusBadge
                  status={serviceRequestDetail.status}
                  type="Request"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          {serviceRequestDetail.imageUrls?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {serviceRequestDetail.imageUrls.map((url, i) => (
                <a
                  key={`${url}-${i}`}
                  href={url}
                  className="venobox bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-center w-28 h-28 overflow-hidden"
                  data-gall="detail-image-gallery"
                  title={`${i18n.language === 'vi' ? 'Ảnh' : 'Image'} ${i + 1}`}
                >
                  <img
                    src={url}
                    alt={`img-${i}`}
                    className="max-w-full max-h-full object-contain rounded-md hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Contractor Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-800">
              {viewingContractorDetail && selectedContractor
                ? t('adminServiceRequestManager.contractorDetail.title')
                : t('adminServiceRequestManager.listCandidate')}
            </h3>
            {!viewingContractorDetail && (
              <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium">
                {totalCount || 0}{' '}
                {t('adminServiceRequestManager.totalCandidate')}
              </span>
            )}
          </div>

          {viewingContractorDetail && selectedContractor ? (
            <>
              {/* Back button - always show when viewing detail */}
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 font-medium cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
                <span>{t('BUTTON.Back')}</span>
              </button>

              <div ref={contractorDetailRef}>
                <div>
                  <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-orange-100 flex-shrink-0">
                        <Avatar
                          name={selectedContractor?.contractorName || 'User'}
                          round={false}
                          size="80"
                          color="#f97316"
                          fgColor="#fff"
                          textSizeRatio={2.5}
                          className="!w-full !h-full !object-cover !rounded-2xl !flex !items-center !justify-center !text-3xl !font-bold"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-2">
                          {selectedContractor.contractorName}
                        </h4>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mb-1">
                          <i className="fa-solid fa-envelope text-orange-500"></i>
                          {selectedContractor.contractorEmail}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <i className="fa-solid fa-phone text-orange-500"></i>
                          {selectedContractor.contractorPhone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={selectedContractor.status}
                      type="Application"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-emerald-600 text-sm font-medium mb-1">
                        {t('adminServiceRequestManager.estimatePrice')}
                      </p>
                      <p className="font-bold text-lg text-emerald-700">
                        {formatVND(selectedContractor.estimatePrice)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-blue-600 text-sm font-medium mb-1">
                        {t(
                          'adminServiceRequestManager.contractorDetail.completedProject'
                        )}
                      </p>
                      <p className="font-bold text-lg text-blue-700">
                        {selectedContractor.completedProjectCount ?? 0}{' '}
                        {t(
                          'adminServiceRequestManager.contractorDetail.project'
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-amber-600 text-sm font-medium mb-1">
                        {t(
                          'adminServiceRequestManager.contractorDetail.rating'
                        )}
                      </p>
                      <p className="font-bold text-lg text-amber-700 flex items-center gap-1">
                        <i className="fa-solid fa-star"></i>
                        {selectedContractor.averageRating}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-purple-600 text-sm font-medium mb-1">
                        {t(
                          'adminServiceRequestManager.contractorDetail.createAt'
                        )}
                      </p>
                      <p className="font-bold text-lg text-purple-700">
                        {new Date(
                          selectedContractor.createdAt
                        ).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                    <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">
                      {t('adminServiceRequestManager.description')}
                    </p>
                    <div
                      className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                      dangerouslySetInnerHTML={{
                        __html: he.decode(selectedContractor.description || ''),
                      }}
                    />
                  </div>

                  {/*Payment Information */}
                  {selectedContractor.status === 'Approved' && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                      <p className="text-indigo-600 text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-solid fa-credit-card"></i>
                        {t(
                          'adminServiceRequestManager.contractorDetail.paymentInfo'
                        )}
                      </p>

                      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-indigo-100 to-blue-100">
                            <tr>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                {t('adminServiceRequestManager.contractorDetail.orderCode')}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                {t('adminServiceRequestManager.contractorDetail.amount')}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                {t('adminServiceRequestManager.description')}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                {t('adminServiceRequestManager.contractorDetail.createAt')}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                                {t('adminServiceRequestManager.status')}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-indigo-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
                                {selectedContractor.payment?.orderCode || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-center">
                                {formatVND(selectedContractor.payment?.amount || 0)}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                {selectedContractor.payment?.description.replaceAll('-', '') || 'No description'}
                              </td>

                              <td className="px-4 py-4 text-sm text-gray-700 text-center">
                                {formatDate(selectedContractor.payment?.paidAt, i18n.language)}
                              </td>

                              <td className="px-4 py-4 text-sm text-gray-900 text-center">
                                <div className="flex justify-center">
                                  <StatusBadge
                                    status={selectedContractor.payment?.status}
                                    type="Payment"
                                  />
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}


                  {/* Commission Countdown - Show when PendingCommission */}
                  {selectedContractor.status === 'PendingCommission' &&
                    selectedContractor.dueCommisionTime && (
                      <div className="mb-6">
                        <CommissionCountdown
                          dueCommisionTime={selectedContractor.dueCommisionTime}
                          onExpired={() => {
                            toast.warning(
                              t(
                                'contractorServiceRequestDetail.paymentDeadlineExpired'
                              )
                            );
                          }}
                          role="admin"
                        />
                      </div>
                    )}

                  {selectedContractor.imageUrls?.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-wide">
                        {t(
                          'adminServiceRequestManager.contractorDetail.images'
                        )}
                      </p>
                      <div className="grid grid-cols-5 gap-3">
                        {selectedContractor.imageUrls.map((url, i) => (
                          <a
                            key={`${url}-${i}`}
                            href={url}
                            className="venobox w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer block"
                            data-gall="contractor-gallery"
                            title={`${i18n.language === 'vi' ? 'Ảnh' : 'Image'
                              } ${i + 1}`}
                          >
                            <img
                              src={url}
                              alt={`contractor-${i}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : contractorApplicationList.length === 0 ? (
            <div className="flex flex-col items-center mt-5 mb-5">
              <i className="text-4xl mb-2 mt-2 fa-solid fa-clipboard-list"></i>
              <h3 className="mb-1 text-lg font-medium text-gray-900">
                {t('adminServiceRequestManager.noContractor')}
              </h3>
              <p className="text-gray-500">
                {t('adminServiceRequestManager.noContractorYet')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contractorApplicationList.map((item) => (
                <button
                  key={item.contractorApplicationID}
                  onClick={() =>
                    handleSelectContractor(item.contractorApplicationID)
                  }
                  className="w-full text-left p-4 border rounded-xl transition-all duration-200 cursor-pointer group bg-white border-gray-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-orange-400">
                        <Avatar
                          name={item?.contractorEmail || 'User'}
                          round
                          size="48"
                          color="#FB8C00"
                          fgColor="#FFFFFF"
                          className="!w-full !h-full !rounded-full !object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-orange-500">
                          {item.contractorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.contractorEmail}
                        </p>
                      </div>
                    </div>

                    <span className="text-orange-500 font-medium">
                      {t('adminServiceRequestManager.viewProfile')}{' '}
                      <i className="fa-solid fa-arrow-right ms-1"></i>
                    </span>
                  </div>
                </button>
              ))}

              {/* Pagination */}
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

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceRequest } from '../../hook/useServiceRequest';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Loading from '../../components/Loading';
import LoadingComponent from '../../components/LoadingComponent';
import { useTranslation } from 'react-i18next';
import { formatDate, formatVND } from '../../utils/formatters';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import StatusBadge from '../../components/StatusBadge';
import { Pagination } from 'antd';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import he from 'he';
import CommissionCountdown from '../../components/partner/CommissionCountdown';
import ChatSection from '../../components/ChatSection';

export default function ServiceRequestDetail() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { serviceRequestId } = useParams();
  const { loading, setServiceRequests, getServiceRequestById } =
    useServiceRequest();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Contractor list pagination
  const [contractorApplications, setContractorApplications] = useState([]);
  const [currentApplicationPage, setCurrentApplicationPage] = useState(1);
  const [loadingContractorApplications, setLoadingContractorApplications] =
    useState(false);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);

  const hasSelectedContractor = Boolean(selectedContractor);

  // Use realtime
  useRealtime({
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
      if (serviceRequestId == payload.serviceRequestID) {
        setContractorApplications((prev) => {
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
      setServiceRequests((prev) =>
        prev.filter((r) => r.serviceRequestID !== payload.serviceRequestID)
      );
      if (serviceRequestId == payload.serviceRequestID) {
        setContractorApplications((prev) =>
          prev.filter(
            (ca) =>
              ca.contractorApplicationID !== payload.contractorApplicationID
          )
        );
        if (
          selectedContractor?.contractorApplicationID ===
          payload.contractorApplicationID
        ) {
          setSelectedContractor(null);
        }
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
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
      setServiceRequest((prev) => {
        if (serviceRequestId == payload.serviceRequestID) {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'Closed',
          };
        }
      });
    },
    [RealtimeEvents.PaymentTransactionUpdated]: async (payload) => {
      setServiceRequest((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          startReviewDate: payload.startReviewDate,
          conversationID: payload.conversationID,
        };
      });
      if (
        payload.contractorApplicationID ===
        selectedContractor?.contractorApplicationID
      ) {
        try {
          const fullContractor =
            await contractorApplicationService.getByIdForCustomer(
              payload.contractorApplicationID
            );
          setSelectedContractor(fullContractor);
        } catch (error) {
          toast.error(t(handleApiError(error)));
        }
      }
    },
  });

  // ---- CONTRACTOR ACTIONS ----
  const handleAcceptContractor = async () => {
    if (!selectedContractor) return;
    const contractorApplicationID = selectedContractor.contractorApplicationID;
    try {
      const approvedContractor = await contractorApplicationService.accept(
        contractorApplicationID
      );
      // Update selectedContractor as single source of truth
      setSelectedContractor(approvedContractor);
      // Also update in the list for consistency
      setContractorApplications((prev) =>
        prev.map((c) =>
          c.contractorApplicationID === contractorApplicationID
            ? approvedContractor
            : c
        )
      );
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  const handleRejectContractor = async () => {
    if (!selectedContractor) return;
    const contractorApplicationID = selectedContractor.contractorApplicationID;
    try {
      const rejected = await contractorApplicationService.reject(
        contractorApplicationID
      );
      // Update selectedContractor as single source of truth
      setSelectedContractor(rejected);
      // Also update in the list for consistency
      setContractorApplications((prev) =>
        prev.map((c) =>
          c.contractorApplicationID === contractorApplicationID ? rejected : c
        )
      );
      toast.success(t('SUCCESS.REJECT_APPLICATION'));
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!serviceRequest && !loading) {
        navigate('/Customer', { state: { tab: 'service_requests' } });
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [serviceRequest, loading, navigate]);

  // ---- FETCH DATA ----
  useEffect(() => {
    if (!serviceRequestId) return;
    const fetchServiceRequest = async () => {
      try {
        const result = await getServiceRequestById(serviceRequestId);
        if (result) {
          setServiceRequest(result);
          // Initialize selectedContractor from server data if exists
          if (result.selectedContractorApplication) {
            setSelectedContractor(result.selectedContractorApplication);
          }
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      }
    };
    fetchServiceRequest();
  }, [serviceRequestId, getServiceRequestById, t]);

  const fetchContractors = useCallback(async () => {
    try {
      setLoadingContractorApplications(true);
      const res = await contractorApplicationService.getAllForCustomer({
        PageNumber: currentApplicationPage,
        PageSize: pageSize,
        FilterID: serviceRequestId,
      });
      setContractorApplications(res.items);
      setTotalCount(res.totalCount);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    } finally {
      setLoadingContractorApplications(false);
    }
  }, [serviceRequestId, t, pageSize, currentApplicationPage]);

  const handleSelectContractor = async (c) => {
    try {
      const fullContractor =
        await contractorApplicationService.getByIdForCustomer(
          c.contractorApplicationID
        );
      setSelectedContractor(fullContractor);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  useEffect(() => {
    if (serviceRequest) fetchContractors();
  }, [serviceRequest, fetchContractors]);

  useEffect(() => {
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  });

  const ICON_MAP = {
    pdf: 'fa-file-pdf text-red-600',
    doc: 'fa-file-word text-blue-600',
    docx: 'fa-file-word text-blue-600',
    xls: 'fa-file-excel text-green-600',
    xlsx: 'fa-file-excel text-green-600',
    ppt: 'fa-file-powerpoint text-orange-600',
    pptx: 'fa-file-powerpoint text-orange-600',
    txt: 'fa-file-lines text-gray-600',
  };
  const DEFAULT_ICON = 'fa-file-alt text-gray-500';

  if (loading || !serviceRequest) return <Loading />;

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white p-3 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative flex items-center justify-between">
            <button
              onClick={() =>
                navigate('/Customer', { state: { tab: 'service_requests' } })
              }
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <i className="fas fa-arrow-left"></i>
              <span>{t('BUTTON.Back')}</span>
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold text-orange-500">
              <i className="fa-solid fa-clipboard-list mr-2"></i>
              {t('userPage.serviceRequestDetail.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i
                  className={`text-orange-600 text-xl fas ${
                    serviceRequest.serviceType === 'Construction'
                      ? 'fa-hammer'
                      : 'fa-screwdriver-wrench'
                  }`}
                />{' '}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                </h1>
                <p className="text-sm text-gray-500">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  {formatDate(serviceRequest.createdAt, i18n.language)}
                </p>
                <span className="text-sm text-gray-500">
                  <i className="fas fa-hashtag mr-1"></i>#
                  {serviceRequest.serviceRequestID.substring(0, 8)}
                </span>
              </div>
              <div className="flex gap-3">
                <StatusBadge status={serviceRequest.status} type="Request" />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                <i className="fas fa-align-left text-gray-500 mr-1"></i>
                {t('userPage.serviceRequestDetail.label_description')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {serviceRequest.description}
              </p>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                <i className="fas fa-map-marker-alt text-orange-500 mr-1"></i>
                {t('userPage.serviceRequestDetail.label_address')}
              </h3>
              <p className="text-gray-600 flex items-start gap-2">
                {`${serviceRequest.address.detail}, ${serviceRequest.address.ward}, ${serviceRequest.address.district}, ${serviceRequest.address.city}`}
              </p>
            </div>

            {/* Images */}
            {serviceRequest.imageUrls.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  <i className="fas fa-images text-orange-500 mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_images')}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {serviceRequest.imageUrls.map((img, idx) => (
                    <a
                      key={img}
                      href={img}
                      className="venobox aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity block border"
                      data-gall="project-gallery"
                    >
                      <img
                        src={img}
                        alt={`${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Documents */}
          {serviceRequest.documentUrls.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                <i className="fas fa-file-alt text-orange-500 mt-1"></i>{' '}
                {t('userPage.serviceRequestDetail.label_documents')}
              </h3>

              <div className="space-y-3">
                {serviceRequest.documentUrls.map((docUrl) => {
                  const fileName = decodeURIComponent(
                    docUrl.split('/').pop()?.split('?')[0] ?? 'document'
                  );
                  const ext = (
                    fileName.includes('.') ? fileName.split('.').pop() : ''
                  ).toLowerCase();

                  const iconClass = ICON_MAP[ext] || DEFAULT_ICON;

                  return (
                    <div
                      key={docUrl}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border ring-1 ring-gray-200 hover:shadow-md transition bg-white"
                    >
                      {/* Icon */}
                      <div className="w-10 h-12 flex items-center justify-center rounded-md bg-gray-50 border">
                        <i className={`fas ${iconClass} text-2xl`} />
                      </div>

                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium text-gray-800 truncate"
                          title={fileName}
                        >
                          {fileName}
                        </p>
                        <div className="mt-0.5 text-xs text-gray-500 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border text-gray-600">
                            {(ext || 'file').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={docUrl}
                          download
                          className="px-2.5 py-1.5 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition"
                        >
                          {t('common.Download')}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specifications Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              <i className="fas fa-tools text-orange-500 mr-2"></i>
              {t('userPage.serviceRequestDetail.label_serviceInfor')}
            </h2>

            {/* Grid specifications */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-box-open mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_packageOption')}
                </p>
                <p className="font-semibold text-gray-900">
                  {t(`Enums.PackageOption.${serviceRequest.packageOption}`)}
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-building mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_buildingType')}
                </p>
                <p className="font-semibold text-gray-900">
                  {t(`Enums.BuildingType.${serviceRequest.buildingType}`)}
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-layer-group mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_mainStructureType')}
                </p>
                <p className="font-semibold text-gray-900">
                  {t(`Enums.MainStructure.${serviceRequest.mainStructureType}`)}
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-pencil-ruler mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_designType')}
                </p>
                <p className="font-semibold text-gray-900">
                  {serviceRequest.designStyle
                    ? t(`Enums.DesignStyle.${serviceRequest.designStyle}`)
                    : t('common.noRequirement')}
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-ruler-horizontal mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_width')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequest.width}
                  <span className="text-sm text-gray-500 font-normal"> m</span>
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-ruler-vertical mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_length')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequest.length}
                  <span className="text-sm text-gray-500 font-normal"> m</span>
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  <i className="fas fa-layer-group mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_floors')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequest.floors}
                </p>
              </div>
            </div>

            {/* Area & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-700 mb-1 uppercase tracking-wide font-medium">
                  <i className="fas fa-vector-square mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_area')}
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {(
                    serviceRequest.width *
                    serviceRequest.length *
                    serviceRequest.floors
                  ).toFixed(1)}
                  <span className="text-sm font-normal"> m²</span>
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1 uppercase tracking-wide font-medium">
                  <i className="fas fa-money-bill-wave mr-1"></i>
                  {t('userPage.serviceRequestDetail.label_estimatePrice')}
                </p>
                {serviceRequest.estimatePrice ? (
                  <>
                    <p className="text-2xl font-bold text-green-900">
                      {(serviceRequest.estimatePrice / 1000000).toFixed(0)}
                      <span className="text-sm font-normal">
                        {i18n.language === 'vi' ? ' triệu' : ' M'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {serviceRequest.estimatePrice.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {t('userPage.serviceRequestDetail.noEstimatePrice')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTRACTOR LIST */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold text-orange-600 mb-4 flex items-center justify-between">
            {hasSelectedContractor ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-hard-hat"></i>
                <span>
                  {t('userPage.serviceRequestDetail.label_selectedContractor')}
                </span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <i className="fas fa-hard-hat"></i>
                  <span>
                    {t('userPage.serviceRequestDetail.section_contractor')}
                  </span>
                </span>
                <span className="ml-2 px-4 py-1 bg-orange-100 text-orange-600 font-bold text-lg rounded-full">
                  {totalCount}{' '}
                  {t('userPage.serviceRequestDetail.contractorApplyCount')}
                </span>
              </>
            )}
          </h4>

          {selectedContractor ? (
            <>
              {!serviceRequest.selectedContractor && (
                <button
                  onClick={() => setSelectedContractor(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 font-medium"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>{t('BUTTON.Back')}</span>
                </button>
              )}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                  {selectedContractor.contractorName?.charAt(0) ||
                    selectedContractor.contractorApplicationID.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {selectedContractor.contractorApplicationID.substring(0, 12)}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm mb-2">
                  <span className="flex items-center gap-1 text-yellow-600">
                    <i className="fas fa-star"></i>
                    <span className="font-semibold">
                      {selectedContractor.averageRating.toFixed(1)}
                    </span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">
                    <i className="fas fa-check-circle text-green-500 mr-1"></i>
                    {selectedContractor.completedProjectCount}{' '}
                    {t('userPage.serviceRequestDetail.label_project')}
                  </span>
                </div>
                <StatusBadge
                  status={selectedContractor.status}
                  type="Application"
                />
                {/* Price Box */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-6 mb-5 mt-5">
                  <p className="text-xs text-green-700 mb-1 uppercase tracking-widest font-semibold">
                    {t('userPage.serviceRequestDetail.label_estimatePrice')}
                  </p>

                  <p className="text-3xl font-bold text-green-900 mb-1">
                    {selectedContractor.estimatePrice < 1_000_000
                      ? formatVND(selectedContractor.estimatePrice)
                      : (selectedContractor.estimatePrice / 1_000_000).toFixed(
                          0
                        )}

                    {selectedContractor.estimatePrice >= 1_000_000 && (
                      <span className="text-lg font-normal ml-2">
                        {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                      </span>
                    )}
                  </p>

                  {selectedContractor.estimatePrice >= 1_000_000 && (
                    <p className="text-xs text-green-700 font-medium">
                      {formatVND(selectedContractor.estimatePrice)}
                    </p>
                  )}
                </div>
              </div>
              {/* Documents  */}
              {selectedContractor?.documentUrls?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    {t('contractorServiceRequestDetail.documents')}
                  </h4>

                  <div className="space-y-3">
                    {selectedContractor.documentUrls.map((doc) => {
                      const fileName = decodeURIComponent(
                        doc.split('/').pop()?.split('?')[0] ?? 'document'
                      );
                      const ext = (
                        fileName.includes('.') ? fileName.split('.').pop() : ''
                      ).toLowerCase();

                      const iconClass = ICON_MAP[ext] || DEFAULT_ICON;

                      return (
                        <div
                          key={doc}
                          className="group relative flex items-center gap-3 p-3 rounded-lg border ring-1 ring-gray-200 hover:shadow-md transition"
                        >
                          {/* Icon */}
                          <div className="w-10 h-12 flex items-center justify-center rounded-md bg-gray-50 border">
                            <i className={`fas ${iconClass} text-2xl`} />
                          </div>

                          {/* Name + meta */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-medium text-gray-800 truncate"
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            <div className="mt-0.5 text-xs text-gray-500 flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border text-gray-600">
                                {(ext || 'file').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <a
                              href={doc}
                              download
                              className="px-2.5 py-1.5 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition"
                            >
                              {t('common.Download')}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Contractor Contact Information - Show when Approved */}
              {selectedContractor.status === 'Approved' && (
                <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-tie text-orange-600"></i>
                    <span>
                      {t(
                        'userPage.serviceRequestDetail.label_contractorInfo'
                      ) || 'Thông tin nhà thầu'}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user text-orange-600"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t(
                            'userPage.serviceRequestDetail.label_contractorName'
                          )}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedContractor.contractorName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-envelope text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedContractor.contractorEmail || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {selectedContractor.contractorPhone && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-phone text-green-600"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t('userPage.serviceRequestDetail.label_phone') ||
                              'Số điện thoại'}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedContractor.contractorPhone}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-tag text-purple-600"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t(
                            'userPage.serviceRequestDetail.label_estimatePrice'
                          )}
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {(selectedContractor.estimatePrice / 1000000).toFixed(
                            0
                          )}{' '}
                          <span className="text-sm">
                            {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatVND(selectedContractor.estimatePrice)}
                        </p>
                      </div>
                    </div>
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
                      role="customer"
                    />
                  </div>
                )}

              {/* Description + Images */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {t(
                    'userPage.serviceRequestDetail.label_descriptionContractor'
                  )}
                </h4>
                <p
                  className="text-lg text-gray-600 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{
                    __html: he.decode(selectedContractor.description),
                  }}
                ></p>

                {selectedContractor.imageUrls?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedContractor.imageUrls.map((img, idx) => (
                      <a
                        key={img}
                        href={img}
                        className="venobox aspect-square rounded-lg overflow-hidden hover:opacity-90 border block"
                        data-gall="proposal-gallery"
                      >
                        <img
                          src={img}
                          alt={`${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedContractor.status === 'Pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAcceptContractor}
                    className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i>
                    {t('BUTTON.Accept')}
                  </button>
                  <button
                    onClick={handleRejectContractor}
                    className="px-4 py-3 bg-white border rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>
                    {t('BUTTON.Reject')}
                  </button>
                </div>
              )}
              {selectedContractor.status === 'Rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-700 font-semibold">
                    <i className="fas fa-times-circle mr-2"></i>
                    {t('userPage.materialRequestDetail.alreadyRejected')}
                  </p>
                </div>
              )}
              {selectedContractor.status === 'PendingCommission' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-700 font-semibold">
                    <i className="fas fa-check-circle mr-2"></i>
                    {t('userPage.materialRequestDetail.waiting')}
                  </p>
                </div>
              )}
            </>
          ) : contractorApplications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t('userPage.serviceRequestDetail.noContractor')}
            </div>
          ) : (
            <div className="space-y-3">
              {loadingContractorApplications ? (
                <div className="flex justify-center py-10">
                  <LoadingComponent />
                </div>
              ) : contractorApplications.length > 0 ? (
                <>
                  {contractorApplications.map((c) => (
                    <button
                      key={c.contractorApplicationID}
                      onClick={() => handleSelectContractor(c)}
                      className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:shadow-md bg-white transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                          {c.contractorApplicationID.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 truncate mb-1">
                            {c.contractorApplicationID.substring(0, 12)}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-star text-yellow-500"></i>
                              <span>{c.averageRating.toFixed(1)}</span>
                            </span>
                            <span>•</span>
                            <span>
                              <i className="fas fa-check-circle text-green-500 mr-1"></i>
                              {c.completedProjectCount}{' '}
                              {t('userPage.serviceRequestDetail.label_project')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <StatusBadge status={c.status} type="Application" />
                        <span className="text-lg font-bold text-orange-600">
                          {(c.estimatePrice / 1000000).toFixed(0)}{' '}
                          <span className="text-sm">
                            {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Pagination */}
                  {totalCount > 0 && (
                    <div className="flex justify-center py-4">
                      <Pagination
                        current={currentApplicationPage}
                        pageSize={pageSize}
                        total={totalCount}
                        onChange={(page) => setCurrentApplicationPage(page)}
                        showSizeChanger={false}
                        size="small"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {t('common.noData')}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Chat Section */}
        <ChatSection
          conversationID={
            serviceRequest.conversationID ||
            serviceRequest.conversation?.conversationID
          }
          contractorApplicationStatus={selectedContractor?.status}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
        />
      </div>
    </div>
  );
}

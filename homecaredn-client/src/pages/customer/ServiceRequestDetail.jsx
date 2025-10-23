import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceRequest } from '../../hook/useServiceRequest';

import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import StatusBadge from '../../components/StatusBadge';

export default function ServiceRequestDetail() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { serviceRequestId } = useParams();
  const { loading, getServiceRequestById } = useServiceRequest();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAcceptContractor = async () => {
    const contractorApplicationID = selectedContractor.contractorApplicationID;
    try {
      const approvedContractor =
        await contractorApplicationService.acceptContractorApplication(
          contractorApplicationID
        );
      setSelectedContractor(approvedContractor);

      setServiceRequest((prev) => ({
        ...prev,
        contractorApplications: prev.contractorApplications.map((c) =>
          c.contractorApplicationID === contractorApplicationID
            ? approvedContractor
            : c
        ),
        selectedContractorApplication: approvedContractor,
      }));
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  const handleRejectContractors = async () => {
    const contractorApplicationID = selectedContractor.contractorApplicationID;
    try {
      const rejectContractor =
        await contractorApplicationService.rejectContractorApplication(
          contractorApplicationID
        );
      setSelectedContractor(rejectContractor);

      setServiceRequest((prev) => ({
        ...prev,
        contractorApplications: prev.contractorApplications.map((c) =>
          c.contractorApplicationID === contractorApplicationID
            ? rejectContractor
            : c
        ),
      }));
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  useEffect(() => {
    if (!serviceRequestId) return;
    const fetchServiceRequest = async () => {
      try {
        setUploadProgress(1);
        const result = await getServiceRequestById(serviceRequestId);
        setServiceRequest(result);
        if (result.selectedContractorApplication) {
          setSelectedContractor(result.selectedContractorApplication);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setUploadProgress(0);
      }
    };
    fetchServiceRequest();
  }, [serviceRequestId, getServiceRequestById, t]);

  useEffect(() => {
    if (!serviceRequest) return;
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  }, [serviceRequest, selectedContractor]);

  if (loading || !serviceRequest) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-3 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative flex items-center justify-between">
            {/* Nút back (bên trái) */}
            <button
              onClick={() =>
                navigate('/Customer', {
                  state: { tab: 'service_requests' },
                })
              }
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <i className="fas fa-arrow-left"></i>
              <span>{t('BUTTON.Back')}</span>
            </button>

            {/* Title ở giữa */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold text-orange-500">
              <i className="fa-solid fa-clipboard-list mr-2"></i>
              {t('userPage.serviceRequestDetail.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-hammer text-orange-600 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(serviceRequest.createdAt, i18n.language)}
                  </p>
                  <span className="text-sm text-gray-500">
                    #{serviceRequest.serviceRequestID.substring(0, 8)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <StatusBadge status={serviceRequest.status} type="Request" />
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('userPage.serviceRequestDetail.label_description')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {serviceRequest.description}
                </p>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  <i className="fas fa-map-marker-alt text-orange-500 mt-1"></i>{' '}
                  {t('userPage.serviceRequestDetail.label_address')}
                </h3>
                <p className="text-gray-600 flex items-start gap-2">
                  <span>
                    {`${serviceRequest.address.detail}, ${serviceRequest.address.ward}, ${serviceRequest.address.district}, ${serviceRequest.address.city}`}
                  </span>
                </p>
              </div>

              {/* Images */}
              {serviceRequest.imageUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <i className="fas fa-images text-orange-500 mt-1"></i>{' '}
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

                      const iconClass =
                        ext === 'pdf'
                          ? 'fa-file-pdf text-red-600'
                          : ext === 'doc' || ext === 'docx'
                          ? 'fa-file-word text-blue-600'
                          : ext === 'xls' || ext === 'xlsx'
                          ? 'fa-file-excel text-green-600'
                          : ext === 'ppt' || ext === 'pptx'
                          ? 'fa-file-powerpoint text-orange-600'
                          : ext === 'txt'
                          ? 'fa-file-lines text-gray-600'
                          : 'fa-file-alt text-gray-500';

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
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                {t('userPage.serviceRequestDetail.label_serviceInfor')}
              </h2>

              {/* Grid specifications */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {t('userPage.serviceRequestDetail.label_packageOption')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {t(`Enums.PackageOption.${serviceRequest.packageOption}`)}
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {t('userPage.serviceRequestDetail.label_buildingType')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {t(`Enums.BuildingType.${serviceRequest.buildingType}`)}
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {t('userPage.serviceRequestDetail.label_mainStructureType')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {t(
                      `Enums.MainStructure.${serviceRequest.mainStructureType}`
                    )}
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
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
                    {t('userPage.serviceRequestDetail.label_width')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {serviceRequest.width}
                    <span className="text-sm text-gray-500 font-normal">
                      {' '}
                      m
                    </span>
                  </p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {t('userPage.serviceRequestDetail.label_length')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {serviceRequest.length}
                    <span className="text-sm text-gray-500 font-normal">
                      {' '}
                      m
                    </span>
                  </p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
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
                    {t('userPage.serviceRequestDetail.label_area')}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {serviceRequest.width *
                      serviceRequest.length *
                      serviceRequest.floors}
                    <span className="text-sm font-normal"> m²</span>
                  </p>
                </div>

                <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-700 mb-1 uppercase tracking-wide font-medium">
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
                        {serviceRequest.estimatePrice.toLocaleString('vi-VN')}{' '}
                        VNĐ
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

          {/* Right Column - Contractors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-28">
              {selectedContractor ? (
                <>
                  {/* Contractor Detail View */}
                  {!serviceRequest.selectedContractorApplication && (
                    <button
                      onClick={() => setSelectedContractor(null)}
                      className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors font-medium"
                    >
                      <i className="fas fa-arrow-left"></i>
                      <span>{t('BUTTON.Back')}</span>
                    </button>
                  )}

                  <div className="text-center mb-6 pb-6 border-b">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                      {selectedContractor.contractorApplicationID.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {selectedContractor.contractorApplicationID.substring(
                        0,
                        12
                      )}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm mb-2">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <i className="fas fa-star"></i>
                        <span className="font-semibold">
                          {selectedContractor.averageRating}
                        </span>
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">
                        <i className="fas fa-check-circle text-green-500 mr-1"></i>
                        {selectedContractor.completedProjectCount}{' '}
                        {t('userPage.serviceRequestDetail.label_project')}
                      </span>
                    </div>
                    <StatusBadge status={selectedContractor.status} type="Application" />
                  </div>
                  {/* Price */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                    <p className="text-xs text-green-700 mb-1 uppercase tracking-wide font-medium">
                      {t('userPage.serviceRequestDetail.label_estimatePrice')}
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {(selectedContractor.estimatePrice / 1000000).toFixed(0)}
                      <span className="text-lg font-normal">
                        {i18n.language === 'vi' ? ' triệu' : ' M'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedContractor.estimatePrice.toLocaleString('vi-VN')}{' '}
                      VNĐ
                    </p>

                    {serviceRequest.estimatePrice && (
                      <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-green-200">
                        {selectedContractor.estimatePrice <
                          serviceRequest.estimatePrice
                          ? t(
                            'userPage.serviceRequestDetail.lowerThanEstimate',
                            {
                              value: (
                                (serviceRequest.estimatePrice -
                                  selectedContractor.estimatePrice) /
                                1000000
                              ).toFixed(0),
                            }
                          )
                          : t(
                            'userPage.serviceRequestDetail.higherThanEstimate',
                            {
                              value: (
                                (selectedContractor.estimatePrice -
                                  serviceRequest.estimatePrice) /
                                1000000
                              ).toFixed(0),
                            }
                          )}
                      </p>
                    )}
                  </div>

                  {/* Description  */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {t(
                        'userPage.serviceRequestDetail.label_descriptionContractor'
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedContractor?.description}
                    </p>
                  </div>

                  {/* Images */}
                  {selectedContractor?.imageUrls?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        {t('contractorServiceRequestDetail.images')}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedContractor.imageUrls.map((img, idx) => (
                          <a
                            key={img}
                            href={img}
                            className="venobox aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity block border"
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
                    </div>
                  )}

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
                            fileName.includes('.')
                              ? fileName.split('.').pop()
                              : ''
                          ).toLowerCase();

                          const iconClass =
                            ext === 'pdf'
                              ? 'fa-file-pdf text-red-600'
                              : ext === 'doc' || ext === 'docx'
                              ? 'fa-file-word text-blue-600'
                              : ext === 'xls' || ext === 'xlsx'
                              ? 'fa-file-excel text-green-600'
                              : ext === 'ppt' || ext === 'pptx'
                              ? 'fa-file-powerpoint text-orange-600'
                              : ext === 'txt'
                              ? 'fa-file-lines text-gray-600'
                              : 'fa-file-alt text-gray-500';

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

                  {/* Contact Info */}
                  {selectedContractor.status === 'Approved' && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        {t('userPage.serviceRequestDetail.label_contact')}
                      </h4>
                      <div className="space-y-2">
                        <a
                          href={`tel:${selectedContractor.phone}`}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-100"
                        >
                          <i className="fas fa-phone text-blue-600"></i>
                          <span className="text-sm text-gray-700 font-medium">
                            {selectedContractor.phone}
                          </span>
                        </a>
                        <a
                          href={`mailto:${selectedContractor.email}`}
                          className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition border border-purple-100"
                        >
                          <i className="fas fa-envelope text-purple-600"></i>
                          <span className="text-sm text-gray-700 font-medium">
                            {selectedContractor.email}
                          </span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedContractor.status === 'Pending' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAcceptContractor()}
                        className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold shadow-sm hover:shadow-md"
                      >
                        <i className="fas fa-check mr-2"></i>
                        {t('BUTTON.Accept')}
                      </button>
                      <button
                        onClick={() => handleRejectContractors()}
                        className="px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300"
                      >
                        <i className="fas fa-times mr-2"></i>
                        {t('BUTTON.Reject')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Contractor List View */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                      {t('userPage.serviceRequestDetail.section_contractor')}
                    </h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {serviceRequest.contractorApplications.length}
                    </span>
                  </div>

                  {serviceRequest.contractorApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-hard-hat text-gray-400 text-2xl"></i>
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        {t('userPage.serviceRequestDetail.noContractor')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('userPage.serviceRequestDetail.noContractorDesc')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                      {serviceRequest.contractorApplications.map((c) => (
                        <button
                          key={c.contractorApplicationID}
                          onClick={() => setSelectedContractor(c)}
                          className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:shadow-md transition-all group bg-white"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {c.contractorApplicationID.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition truncate mb-1">
                                {c.contractorApplicationID.substring(0, 12)}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-star text-yellow-500"></i>
                                  <span className="font-medium">
                                    {c.averageRating}
                                  </span>
                                </span>
                                <span>•</span>
                                <span>
                                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                                  {c.completedProjectCount}{' '}
                                  {t(
                                    'userPage.serviceRequestDetail.label_project'
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-xs text-gray-500 tracking-wide">
                              <StatusBadge status={c.status} type="Application" />
                            </span>
                            <span className="text-lg font-bold text-orange-600">
                              <span className="text-sm text-gray-500 font-normal">
                                {t(
                                  'userPage.serviceRequestDetail.label_estimatePrice'
                                )}{' '}
                              </span>
                              {(c.estimatePrice / 1000000).toFixed(0)}{' '}
                              <span className="text-sm">
                                {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                              </span>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

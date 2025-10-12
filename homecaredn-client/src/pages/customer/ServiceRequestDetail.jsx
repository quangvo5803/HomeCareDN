import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceRequest } from '../../hook/useServiceRequest';

import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';

export default function ServiceRequestDetail() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { serviceRequestId } = useParams();
  const { loading, getServiceRequestById } = useServiceRequest();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);

  const [messages, setMessages] = useState([
    { sender: 'contractor', text: 'Xin chào, tôi đã xem yêu cầu của bạn.' },
  ]);
  const [input, setInput] = useState('');
  useEffect(() => {
    if (!serviceRequestId) return;
    const fetchServiceRequest = async () => {
      const result = await getServiceRequestById(serviceRequestId);
      setServiceRequest(result);
    };
    fetchServiceRequest();
  }, [serviceRequestId, getServiceRequestById]);

  useEffect(() => {
    // Khởi tạo Venobox sau khi component render
    const venoboxInstance = new VenoBox({
      selector: '.venobox',
      numeration: true,
      infinigall: true,
      spinner: 'rotating-plane',
      spinColor: '#f97316',
    });

    // Cleanup khi component unmount
    return () => {
      venoboxInstance?.close?.();
    };
  }, [selectedContractor]);

  const handleSend = () => {
    if (!input.trim() || !selectedContractor) return;
    const newMsg = { sender: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  if (loading || !serviceRequest) return <Loading />;
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-between px-8 py-6 bg-white shadow-lg">
        <button
          onClick={() =>
            navigate('/Customer/Profile', {
              state: { tab: 'service_requests' },
            })
          }
          className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-x-1 font-medium"
        >
          <i className="fas fa-arrow-left text-lg"></i>
          <span>{t('BUTTON.Back')}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <i className="fas fa-file-alt text-white text-lg"></i>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            {t('userPage.serviceRequestDetail.title')}
          </h1>
        </div>

        <div className="w-32"></div>
      </div>

      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        <div className="w-2/3 space-y-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <i className="fas fa-hard-hat text-orange-600 text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {t('userPage.serviceRequestDetail.label_serviceType')}{' '}
                      {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      #{serviceRequest.serviceRequestID.substring(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <i className="fas fa-clock mr-1"></i>
                    {serviceRequest.isOpen
                      ? t('userPage.serviceRequestDetail.label_open')
                      : t('userPage.serviceRequestDetail.label_close')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-calendar-plus text-green-600 text-lg"></i>
                  <div>
                    <p className="text-xs text-gray-500">Ngày tạo</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(serviceRequest.createdAt, i18n.language)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-align-left text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('userPage.serviceRequestDetail.label_description')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-7">
                  {serviceRequest.description}
                </p>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-location-dot text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('userPage.serviceRequestDetail.label_address')}
                  </h3>
                </div>
                <p className="text-gray-700 pl-7">
                  {`${serviceRequest.address.detail}, ${serviceRequest.address.ward}, ${serviceRequest.address.district}, ${serviceRequest.address.city}`}
                </p>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-info-circle text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('userPage.serviceRequestDetail.label_serviceInfor')}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-box text-amber-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_packageOption')}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {t(`Enums.PackageOption.${serviceRequest.packageOption}`)}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-building text-sky-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_buildingType')}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {t(`Enums.BuildingType.${serviceRequest.buildingType}`)}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-hammer text-rose-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t(
                          'userPage.serviceRequestDetail.label_mainStructureType'
                        )}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {t(
                        `Enums.MainStructure.${serviceRequest.mainStructureType}`
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-palette text-violet-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_designType')}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {serviceRequest.designStyle
                        ? t(`Enums.DesignStyle.${serviceRequest.designStyle}`)
                        : t('common.noRequirement')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-ruler-combined text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('userPage.serviceRequestDetail.label_number')}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-arrows-left-right text-green-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_width')}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.width}
                      <span className="text-sm"> m</span>
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-arrows-up-down text-blue-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_length')}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.length}
                      <span className="text-sm"> m</span>
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-layer-group text-purple-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        {t('userPage.serviceRequestDetail.label_floors')}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.floors}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-expand text-indigo-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">
                      {t('userPage.serviceRequestDetail.label_area')}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {serviceRequest.width *
                      serviceRequest.length *
                      serviceRequest.floors}
                    <span className="text-lg"> m²</span>
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-money-bill-wave text-emerald-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">
                      {' '}
                      {t('userPage.serviceRequestDetail.label_estimatePrice')}
                    </p>
                  </div>
                  {serviceRequest.estimatePrice ? (
                    <>
                      <p className="text-3xl font-bold text-emerald-700">
                        {(serviceRequest.estimatePrice / 1000000).toFixed(0)}
                        <span className="text-lg">
                          {i18n.language === 'vi' ? ' triệu' : ' million'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-images text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('userPage.serviceRequestDetail.label_images')}
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-3 pl-7">
                  {serviceRequest.imageUrls.map((img, idx) => (
                    <a
                      key={img}
                      href={img}
                      className="venobox aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-gray-200 hover:border-orange-400 hover:scale-105 transform block"
                      data-gall="project-gallery"
                    >
                      <img
                        src={img}
                        alt={`Hình ảnh dự án ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/3 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto">
          {selectedContractor ? (
            <>
              <button
                onClick={() => setSelectedContractor(null)}
                className="text-sm text-gray-600 hover:text-orange-600 mb-4 flex items-center gap-2 font-medium transition"
              >
                <i className="fas fa-arrow-left"></i>
                <span>{t('BUTTON.Back')}</span>
              </button>
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-orange-200 mx-auto mb-4">
                    {selectedContractor.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedContractor.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-yellow-600">
                      <i className="fas fa-star"></i>
                      <span className="font-bold">
                        {selectedContractor.rating}
                      </span>
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      <i className="fas fa-comments mr-1"></i>
                      {selectedContractor.reviewCount}{' '}
                      {t('userPage.serviceRequestDetail.label_review')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <i className="fas fa-check-double text-green-600 text-xl mb-1"></i>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedContractor.completedProjects}
                    </p>
                    <p className="text-xs text-gray-600">
                      {' '}
                      {t('userPage.serviceRequestDetail.label_project')}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <i className="fas fa-award text-blue-600 text-xl mb-1"></i>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedContractor.rating}
                    </p>
                    <p className="text-xs text-gray-600">
                      {' '}
                      {t('userPage.serviceRequestDetail.label_review')}
                    </p>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-hand-holding-dollar text-emerald-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">
                      {t('userPage.serviceRequestDetail.label_estimatePrice')}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">
                    {(selectedContractor.estimatePrice / 1000000).toFixed(0)}
                    {i18n.language === 'vi' ? ' triệu' : ' million'} VNĐ
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedContractor.estimatePrice.toLocaleString('vi-VN')}
                    VNĐ
                  </p>
                  {serviceRequest.estimatePrice && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs text-gray-600">
                        {selectedContractor.bidPrice <
                        serviceRequest.estimatePrice
                          ? t(
                              'userPage.serviceRequestDetail.lowerThanEstimate',
                              {
                                value: (
                                  (serviceRequest.estimatePrice -
                                    selectedContractor.bidPrice) /
                                  1000000
                                ).toFixed(0),
                              }
                            )
                          : t(
                              'userPage.serviceRequestDetail.higherThanEstimate',
                              {
                                value: (
                                  (selectedContractor.bidPrice -
                                    serviceRequest.estimatePrice) /
                                  1000000
                                ).toFixed(0),
                              }
                            )}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-clipboard-list text-orange-500"></i>
                    <span>
                      {t(
                        'userPage.serviceRequestDetail.label_descriptionContractor'
                      )}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {selectedContractor.proposalDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedContractor.proposalImages.map((img, idx) => (
                      <a
                        key={img}
                        href={img}
                        className="venobox aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-gray-200 hover:border-orange-400 hover:scale-105 transform block"
                        data-gall="proposal-gallery"
                      >
                        <img
                          src={img}
                          alt={`Phương án thi công ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
                {selectedContractor.status === 'Approved' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <i className="fas fa-address-book text-orange-500"></i>
                      <span>
                        {t('userPage.serviceRequestDetail.label_contact')}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      <a
                        href={`tel:${selectedContractor.phone}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        <i className="fas fa-phone text-blue-600"></i>
                        <span className="text-sm text-gray-700">
                          {selectedContractor.phone}
                        </span>
                      </a>
                      <a
                        href={`mailto:${selectedContractor.email}`}
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                      >
                        <i className="fas fa-envelope text-purple-600"></i>
                        <span className="text-sm text-gray-700">
                          {selectedContractor.email}
                        </span>
                      </a>
                    </div>
                  </div>
                )}
                {selectedContractor.status !== 'Pending' &&
                  !serviceRequest.selectedContractorApplication && (
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-sm">
                        <i className="fas fa-handshake mr-2"></i>
                        <span> {t('BUTTON.Accept')}</span>
                      </button>
                      <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm">
                        <i className="fas fa-times mr-2"></i>
                        <span>{t('BUTTON.Reject')}</span>
                      </button>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {t('userPage.serviceRequestDetail.section_contractor')}
                </h3>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {serviceRequest.contractorApplications.length}{' '}
                  {t('userPage.serviceRequestDetail.contractorApplyCount')}
                </span>
              </div>

              {serviceRequest.contractorApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                    <i className="fas fa-hard-hat text-orange-300 text-4xl"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    {t('userPage.serviceRequestDetail.noContractor')}
                  </h4>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    {t('userPage.serviceRequestDetail.noContractorDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequest.contractorApplications.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedContractor(c)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-orange-400 hover:shadow-lg hover:scale-105 group bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-200 group-hover:border-orange-400 flex-shrink-0">
                          {c.contractorApplicationID.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition truncate">
                            {c.contractorApplicationID.substring(0, 8)}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                              <i className="fas fa-star"></i>
                              <span className="font-semibold">{c.rating}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              <i className="fas fa-comments mr-1"></i>
                              {c.averageRating}{' '}
                              {t('userPage.serviceRequestDetail.label_review')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pl-1">
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {c.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            <i className="fas fa-check-circle text-green-600 mr-1"></i>
                            {c.completedProjectCount}
                            {t('userPage.serviceRequestDetail.label_project')}
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            {(c.EstimatePrice / 1000000).toFixed(0)}{' '}
                            {i18n.language === 'vi' ? 'triệu' : 'million'} VNĐ
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="relative border-t bg-white p-4">
        <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
          <i className="fas fa-comments"></i>
          <span> {t('userPage.serviceRequestDetail.section_chat')}</span>
        </h4>
        <div className="h-128 overflow-y-auto bg-gray-50 p-3 rounded-lg mb-3">
          {messages.map((m) => (
            <div
              key={m}
              className={`mb-2 flex ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[70%] ${
                  m.sender === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Nhập tin nhắn..."
            disabled={true}
          />
          <button
            onClick={handleSend}
            disabled={true}
            className="px-4 py-2 rounded-lg transition bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Gửi
          </button>
        </div>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <i className="fas fa-lock text-4xl mb-3"></i>
            <p> {t('userPage.serviceRequestDetail.noChatFunction')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

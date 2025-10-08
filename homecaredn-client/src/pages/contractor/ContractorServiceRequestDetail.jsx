import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useServiceRequest } from '../../hook/useServiceRequest';
import { formatVND } from '../../utils/formatters';
import { numberToWordsByLang } from '../../utils/numberToWords';
import Loading from '../../components/Loading';

export default function ContractorServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getServiceRequestById, loading } = useServiceRequest();
  
  const [serviceRequest, setServiceRequest] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [noteToOwner, setNoteToOwner] = useState('');

  useEffect(() => {
    const loadServiceRequest = async () => {
      const data = await getServiceRequestById(serviceRequestId);
      setServiceRequest(data);
    };
    loadServiceRequest();
  }, [serviceRequestId, getServiceRequestById]);

  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const handleImageKeyDown = (event, imageUrl) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.open(imageUrl, '_blank');
    }
  };

  const handleApplyForProject = () => {
    // Handle application logic
    console.log('Applying for project with:', {
      bidPrice,
      startDate,
      durationDays,
      noteToOwner
    });
  };

  if (loading) return <Loading />;
  if (!serviceRequest) return <div>{t('contractorServiceRequestDetail.serviceRequestNotFound')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <div className="mb-3">
        <button
          onClick={() => navigate('/Contractor/service-requests')}
          className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <i className="fas fa-arrow-left mr-2" />
          {t('contractorServiceRequestDetail.backToList')}
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          <span className="inline-flex items-center justify-center gap-3">
            <i className="fas fa-clipboard-list text-orange-600" />
            {t('contractorServiceRequestDetail.title')}
          </span>
        </h1>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Details */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex justify-between items-start text-white">
                <div className="inline-flex items-center gap-2">
                  <i className="fas fa-wrench" />
                  <h2 className="text-xl font-semibold">
                    {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-screwdriver-wrench mr-2" />
                    {t('contractorServiceRequestDetail.serviceType')}
                  </label>
                  <p className="text-gray-900">{t(`Enums.ServiceType.${serviceRequest.serviceType}`)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-box-open mr-2" />
                    {t('contractorServiceRequestDetail.packageOption')}
                  </label>
                  <p className="text-gray-900">{t(`Enums.PackageOption.${serviceRequest.packageOption}`)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-building mr-2" />
                    {t('contractorServiceRequestDetail.buildingType')}
                  </label>
                  <p className="text-gray-900">{t(`Enums.BuildingType.${serviceRequest.buildingType}`)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-cubes mr-2" />
                    {t('contractorServiceRequestDetail.structureType')}
                  </label>
                  <p className="text-gray-900">{t(`Enums.MainStructure.${serviceRequest.mainStructureType}`)}</p>
                </div>
                {serviceRequest.designStyle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-palette mr-2" />
                      {t('contractorServiceRequestDetail.designStyle')}
                    </label>
                    <p className="text-gray-900">{t(`Enums.DesignStyle.${serviceRequest.designStyle}`)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-th-large mr-2" />
                    {t('contractorServiceRequestDetail.floors')}
                  </label>
                  <p className="text-gray-900">
                    {serviceRequest.floors} {t('contractorServiceRequestDetail.floorsUnit')}
                  </p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-ruler-combined" />
                  {t('contractorServiceRequestDetail.dimensions')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-arrows-alt-h mr-2" />
                      {t('contractorServiceRequestDetail.width')}
                    </label>
                    <p className="text-gray-900">{serviceRequest.width} m</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-arrows-alt-v mr-2" />
                      {t('contractorServiceRequestDetail.length')}
                    </label>
                    <p className="text-gray-900">{serviceRequest.length} m</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-expand-arrows-alt mr-2" />
                      {t('contractorServiceRequestDetail.totalArea')}
                    </label>
                    <p className="text-xl font-bold text-orange-600">
                      {serviceRequest.width * serviceRequest.length * serviceRequest.floors} m²
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              {serviceRequest.estimatePrice && (
                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <i className="fas fa-dollar-sign" />
                    {t('contractorServiceRequestDetail.estimatePrice')}
                  </h3>
                  <p className="text-2xl font-bold text-orange-600 mb-2">
                    {formatVND(serviceRequest.estimatePrice)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {numberToWordsByLang(serviceRequest.estimatePrice)}
                  </p>
                </div>
              )}

              {/* Address */}
              {serviceRequest.address && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <i className="fas fa-map-marker-alt" />
                    {t('contractorServiceRequestDetail.address')}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">
                      {serviceRequest.address.detail}, {serviceRequest.address.ward},
                      {serviceRequest.address.district}, {serviceRequest.address.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-align-left" />
                  {t('contractorServiceRequestDetail.description')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {serviceRequest.description}
                  </p>
                </div>
              </div>

              {/* Images - FIXED: Proper accessibility and unique keys */}
              {serviceRequest.imageUrls && serviceRequest.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <i className="fas fa-images" />
                    {t('contractorServiceRequestDetail.images')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {serviceRequest.imageUrls.map((imageUrl) => (
                      <div 
                        key={imageUrl} // Using imageUrl as unique key instead of index
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          className="w-full h-full p-0 border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                          onClick={() => handleImageClick(imageUrl)}
                          onKeyDown={(e) => handleImageKeyDown(e, imageUrl)}
                          aria-label={`${t('contractorServiceRequestDetail.viewFullSize')} - ${t('contractorServiceRequestDetail.serviceRequestImage')}`}
                        >
                          <img
                            src={imageUrl}
                            alt={t('contractorServiceRequestDetail.serviceRequestImage')} // Removed redundant "image" word
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATUS */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-info-circle" />
                  {t('contractorServiceRequestDetail.applicationStatus')}
                </h3>
                <div className={`rounded-lg p-4 ring-1 ${serviceRequest.isOpen ? 'bg-green-50 ring-green-200' : 'bg-gray-50 ring-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${serviceRequest.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-gray-800 font-medium">
                      {serviceRequest.isOpen
                        ? t('contractorServiceRequestDetail.statusOpen')
                        : t('contractorServiceRequestDetail.statusClosed')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Apply Form - FIXED: Controlled inputs with proper state management */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-6 lg:sticky lg:top-24">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
              <i className="fas fa-clipboard-list" />
              {t('contractorServiceRequestDetail.applyFormTitle')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-coins mr-2" />
                  {t('contractorServiceRequestDetail.bidPrice')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  placeholder={
                    serviceRequest.estimatePrice
                      ? t('contractorServiceRequestDetail.bidPricePlaceholderWithEst', { est: formatVND(serviceRequest.estimatePrice) })
                      : t('contractorServiceRequestDetail.bidPricePlaceholder')
                  }
                  aria-label={t('contractorServiceRequestDetail.bidPrice')}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {serviceRequest.estimatePrice && (
                  <p className="mt-1 text-xs text-gray-500">
                    {numberToWordsByLang(serviceRequest.estimatePrice)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-calendar-alt mr-2" />
                    {t('contractorServiceRequestDetail.startDate')}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label={t('contractorServiceRequestDetail.startDate')}
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-hourglass-half mr-2" />
                    {t('contractorServiceRequestDetail.durationDays')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder={t('contractorServiceRequestDetail.durationDaysPlaceholder')}
                    aria-label={t('contractorServiceRequestDetail.durationDays')}
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-comment-alt mr-2" />
                  {t('contractorServiceRequestDetail.noteToOwner')}
                </label>
                <textarea
                  rows={4}
                  value={noteToOwner}
                  onChange={(e) => setNoteToOwner(e.target.value)}
                  placeholder={t('contractorServiceRequestDetail.notePlaceholder')}
                  aria-label={t('contractorServiceRequestDetail.noteToOwner')}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleApplyForProject}
                  disabled={!bidPrice.trim() || !startDate || !durationDays}
                >
                  <i className="fas fa-paper-plane" />
                  {t('contractorServiceRequestDetail.applyForProject')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

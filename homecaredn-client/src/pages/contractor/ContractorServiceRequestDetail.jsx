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

  useEffect(() => {
    const loadServiceRequest = async () => {
      const data = await getServiceRequestById(serviceRequestId);
      setServiceRequest(data);
    };
    loadServiceRequest();
  }, [serviceRequestId, getServiceRequestById]);

  if (loading) return <Loading />;
  if (!serviceRequest) return <div>Service request not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/contractor/service-requests')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            {t('button.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('contractor.serviceRequest.detail.title')}
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex justify-between items-start text-white">
              <div>
                <h2 className="text-xl font-semibold">
                  {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                </h2>
                <p className="text-orange-100">ID: {serviceRequest.serviceRequestID}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                serviceRequest.isOpen 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {serviceRequest.isOpen ? t('status.open') : t('status.closed')}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.serviceType')}
                </label>
                <p className="text-gray-900">{t(`Enums.ServiceType.${serviceRequest.serviceType}`)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.packageOption')}
                </label>
                <p className="text-gray-900">{t(`Enums.PackageOption.${serviceRequest.packageOption}`)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.buildingType')}
                </label>
                <p className="text-gray-900">{t(`Enums.BuildingType.${serviceRequest.buildingType}`)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.structureType')}
                </label>
                <p className="text-gray-900">{t(`Enums.MainStructure.${serviceRequest.mainStructureType}`)}</p>
              </div>
              
              {serviceRequest.designStyle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.designStyle')}
                  </label>
                  <p className="text-gray-900">{t(`Enums.DesignStyle.${serviceRequest.designStyle}`)}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.floors')}
                </label>
                <p className="text-gray-900">{serviceRequest.floors} {t('common.floors')}</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('contractor.serviceRequest.dimensions')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.width')}
                  </label>
                  <p className="text-gray-900">{serviceRequest.width} m</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.length')}
                  </label>
                  <p className="text-gray-900">{serviceRequest.length} m</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.totalArea')}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('form.estimatePrice')}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('form.address')}
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('form.description')}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {serviceRequest.description}
                </p>
              </div>
            </div>

            {/* Images */}
            {serviceRequest.imageUrls && serviceRequest.imageUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('form.images')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {serviceRequest.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Service request image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => {/* Handle application logic */}}
              >
                {t('contractor.serviceRequest.applyForProject')}
              </button>
              <button
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => navigate('/contractor/service-requests')}
              >
                {t('button.backToList')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

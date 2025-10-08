import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { formatVND } from '../../utils/formatters';
import Loading from '../../components/Loading';

export default function ContractorServiceRequestManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    serviceRequests, 
    loading, 
    fetchServiceRequests,
    totalServiceRequests 
  } = useServiceRequest();
  
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);
  
  useEffect(() => {
    fetchServiceRequests({ PageNumber: currentPage, PageSize: pageSize });
  }, [currentPage, pageSize, fetchServiceRequests]);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('contractor.serviceRequest.title')}
        </h1>
        <p className="text-gray-600">
          {t('contractor.serviceRequest.subtitle')}
        </p>
      </div>

      {/* Service Request Grid */}
      <div className="grid gap-6">
        {serviceRequests.map((request) => (
          <div key={request.serviceRequestID} 
               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Request Card Content */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t(`Enums.ServiceType.${request.serviceType}`)}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {request.serviceRequestID}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                request.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {request.isOpen ? t('status.open') : t('status.closed')}
              </span>
            </div>
            
            {/* Request Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{t('form.packageOption')}</p>
                <p className="font-medium">{t(`Enums.PackageOption.${request.packageOption}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.buildingType')}</p>
                <p className="font-medium">{t(`Enums.BuildingType.${request.buildingType}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.area')}</p>
                <p className="font-medium">{request.width * request.length} m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.estimatePrice')}</p>
                <p className="font-medium text-orange-600">
                  {request.estimatePrice ? formatVND(request.estimatePrice) : t('common.negotiable')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                {t('common.createdAt')}: {new Date(request.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => navigate(`/contractor/service-request/${request.serviceRequestID}`)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('button.viewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalServiceRequests > pageSize && (
        <div className="mt-8 flex justify-center">
          {/* Pagination Component */}
        </div>
      )}
    </div>
  );
}

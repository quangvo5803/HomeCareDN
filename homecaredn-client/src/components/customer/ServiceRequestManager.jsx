import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { handleApiError } from '../../utils/handleApiError';
import { showDeleteModal } from '../modal/DeleteModal';
import StatusBadge from '../StatusBadge';
import Loading from '../Loading';

export default function ServiceRequestManager({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    loading,
    serviceRequests,
    fetchServiceRequestsByUserId,
    deleteServiceRequest,
  } = useServiceRequest();

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        await fetchServiceRequestsByUserId({ FilterID: user.id });
      } catch (err) {
        toast.error(handleApiError(err, t('ERROR.LOAD_ERROR')));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleServiceRequestViewDetail = (serviceRequestId) => {
    navigate(`/Customer/ServiceRequestDetail/${serviceRequestId}`);
  };

  const handleServiceRequestCreateUpdate = (serviceRequestId) => {
    navigate(
      serviceRequestId
        ? `/Customer/ServiceRequest/${serviceRequestId}`
        : '/Customer/ServiceRequest'
    );
  };

  const handleDeleteServiceRequest = (serviceRequestID) => {
    showDeleteModal({
      t,
      titleKey: t('ModalPopup.DeleteServiceRequestModal.title'),
      textKey: t('ModalPopup.DeleteServiceRequestModal.text'),
      onConfirm: async () => {
        try {
          await deleteServiceRequest(serviceRequestID);
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
        } catch (err) {
          handleApiError(err, t);
        }
      },
    });
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'Repair':
        return 'fa-drafting-compass';
      case 'Construction':
        return 'fa-hammer';
      default:
        return 'fa-wrench';
    }
  };

  const getPackageBadge = (packageOption) => {
    let optionClass = '';
    let optionIcon = '';

    switch (packageOption) {
      case 'StructureOnly':
        optionClass = 'bg-blue-100 text-blue-800';
        optionIcon = 'fa-star-half-alt';
        break;
      case 'BasicFinish':
        optionClass = 'bg-orange-100 text-orange-800';
        optionIcon = 'fa-star';
        break;
      case 'FullFinish':
        optionClass = 'bg-purple-100 text-purple-800';
        optionIcon = 'fa-crown';
        break;
      default:
        optionClass = 'bg-gray-100 text-gray-800';
        optionIcon = 'fa-box';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${optionClass}`}
      >
        <i className={`fas ${optionIcon} mr-1`} />
        {t(`Enums.PackageOption.${packageOption}`)}
      </span>
    );
  };

  const getContractorBadge = (count) => (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <i className="fas fa-users mr-1"></i>
      {count} {t('userPage.serviceRequest.label_contractorApplied')}
    </span>
  );

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            <i className="fas fa-clipboard-list text-orange-600 mr-2"></i>
            {t('userPage.serviceRequest.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('userPage.serviceRequest.subtitle')} (
            {serviceRequests?.length || 0}/3)
          </p>
        </div>
        <button
          onClick={() => handleServiceRequestCreateUpdate()}
          disabled={serviceRequests?.length >= 3}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          {t('BUTTON.CreateServiceRequest')}
        </button>
      </div>

      {!serviceRequests || serviceRequests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <i className="fas fa-tools text-3xl text-orange-600"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {t('userPage.serviceRequest.noRequest')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('userPage.serviceRequest.letStart')}
          </p>
          <button
            onClick={() => handleServiceRequestCreateUpdate()}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            {t('BUTTON.CreateServiceRequest')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {serviceRequests.map((req) => (
            <div
              key={req.serviceRequestID}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                      <i
                        className={`fas ${getServiceIcon(
                          req.serviceType
                        )} text-orange-600`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                        {t(`Enums.ServiceType.${req.serviceType}`)}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar-alt"></i>
                          {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-hashtag"></i>
                          {req.serviceRequestID.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {req.description?.length > 100
                        ? req.description.slice(0, 100) + '...'
                        : req.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-building text-orange-500"></i>
                        {t('userPage.serviceRequest.label_buildingType')}
                        <span className="font-bold">
                          {t(`Enums.BuildingType.${req.buildingType}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-cube text-orange-500"></i>
                        {t('userPage.serviceRequest.label_mainStructureType')}
                        <span className="font-bold">
                          {t(`Enums.MainStructure.${req.mainStructureType}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-ruler text-orange-500"></i>
                        {t('userPage.serviceRequest.label_area')}
                        <span className="font-bold">
                          {req.width}m × {req.length}m
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-layer-group text-orange-500"></i>
                        {t('userPage.serviceRequest.label_floors')}
                        <span className="font-bold">{req.floors}</span>
                      </div>
                    </div>

                    {req.designStyle && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-palette text-orange-500"></i>
                        {t('userPage.serviceRequest.label_designStyle')}
                        <span className="font-bold">
                          {t(`Enums.DesignStyle.${req.designStyle}`)}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-location-dot text-orange-500"></i>
                      {t('userPage.serviceRequest.label_address')}
                      <span className="font-semibold">
                        {req.address.detail}, {req.address.ward},{' '}
                        {req.address.district}, {req.address.city}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <i className="fas fa-money-bill-wave text-orange-500"></i>
                      {req.estimatePrice ? (
                        <span className="text-emerald-600 font-semibold">
                          {t('userPage.serviceRequest.label_estimatePrice')}
                          {req.estimatePrice.toLocaleString('vi-VN')} VNĐ
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">
                          {t('userPage.serviceRequest.label_notEstimated')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {getPackageBadge(req.packageOption)}
                      {getContractorBadge(req.contractorApplyCount)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                        onClick={() =>
                          handleServiceRequestViewDetail(req.serviceRequestID)
                        }
                      >
                        <i className="fas fa-eye"></i>
                        {t('BUTTON.ViewDetail')}
                      </button>

                      {req.contractorApplyCount === 0 && (
                        <button
                          className="text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                          onClick={() =>
                            handleServiceRequestCreateUpdate(
                              req.serviceRequestID
                            )
                          }
                        >
                          <i className="fas fa-edit"></i>
                          {t('BUTTON.Edit')}
                        </button>
                      )}

                      <button
                        className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                        onClick={() =>
                          handleDeleteServiceRequest(req.serviceRequestID)
                        }
                      >
                        <i className="fas fa-xmark"></i>
                        {t('BUTTON.Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ServiceRequestManager.propTypes = {
  user: PropTypes.object.isRequired,
};

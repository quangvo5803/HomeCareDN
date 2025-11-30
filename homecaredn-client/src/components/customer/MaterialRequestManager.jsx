import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../../utils/handleApiError';
import { showDeleteModal } from '../modal/DeleteModal';
import Loading from '../Loading';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import StatusBadge from '../../components/StatusBadge';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import ReviewCountdown from './ReviewCountdown';
import { reviewService } from '../../services/reviewService';
import ReviewModal from '../modal/ReviewModal';
import { formatDate } from '../../utils/formatters';

export default function MaterialRequestManager({ user }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const {
    setMaterialRequests,
    loading,
    materialRequests,
    createMaterialRequest,
    deleteMaterialRequest,
  } = useMaterialRequest();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMaterialRequest, setSelectedMaterialRequest] = useState(null);
  const [reviewReadOnly, setReviewReadOnly] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useRealtime({
    [RealtimeEvents.DistributorApplicationCreated]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((sr) =>
          sr.materialRequestID === payload.materialRequestID
            ? {
                ...sr,
                distributorApplyCount: (sr.distributorApplyCount || 0) + 1,
              }
            : sr
        )
      );
    },
    [RealtimeEvents.DistributorApplicationAccept]: (payload) => {
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
        prev.map((sr) =>
          sr.materialRequestID === payload.materialRequestID
            ? {
                ...sr,
                distributorApplyCount: Math.max(
                  0,
                  (sr.distributorApplyCount || 1) - 1
                ),
              }
            : sr
        )
      );
    },
    [RealtimeEvents.PaymentTransactionUpdated]: (payload) => {
      setMaterialRequests((prev) =>
        prev.map((sr) =>
          sr.materialRequestID === payload.materialRequestID
            ? {
                ...sr,
                status: 'Closed',
                startReviewDate: payload.startReviewDate,
              }
            : sr
        )
      );
    },
  });

  const handleViewDetail = (materialRequestID) => {
    navigate(`/Customer/MaterialRequestDetail/${materialRequestID}`);
  };

  const handleCreate = async () => {
    if (
      materialRequests.filter(
        (m) => m.status == 'Draft' || m.status == 'Opening'
      ).length >= 3
    ) {
      toast.error(t('ERROR.MAXIMUM_MATERIAL_REQUEST'));
      return;
    }
    setIsCreating(true);
    await createMaterialRequest({ CustomerID: user.id });
    setIsCreating(false);
  };

  const handleDelete = async (materialRequestID) => {
    showDeleteModal({
      t,
      titleKey: t('ModalPopup.DeleteMaterialRequestModal.title'),
      textKey: t('ModalPopup.DeleteMaterialRequestModal.text'),
      onConfirm: async () => {
        try {
          await deleteMaterialRequest(materialRequestID);
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
        } catch (err) {
          handleApiError(err, t);
        }
      },
    });
  };
  const handleCreateReview = (serviceRequest) => {
    setSelectedMaterialRequest(serviceRequest);
    setReviewReadOnly(false);
    setIsReviewModalOpen(true);
  };

  const handleViewReview = (serviceRequest) => {
    setSelectedMaterialRequest(serviceRequest);
    setReviewReadOnly(true);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (reviewData) => {
    try {
      const response = await reviewService.create(reviewData);
      toast.success(t('SUCCESS.CREATE_REVIEW'));

      // Update service request with new review
      setMaterialRequests((prev) =>
        prev.map((sr) =>
          sr.materialRequestID === response.materialRequestID
            ? { ...sr, review: response }
            : sr
        )
      );
      setIsReviewModalOpen(false);
      setSelectedMaterialRequest(null);
    } catch (err) {
      handleApiError(err, t);
    }
  };
  if (loading || uploadProgress) return <Loading progress={uploadProgress} />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            <i className="fas fa-boxes text-orange-600 mr-2"></i>
            {t('userPage.materialRequest.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('userPage.materialRequest.subtitle')} (
            {materialRequests.filter(
              (m) => m.status == 'Draft' || m.status == 'Opening'
            ).length || 0}
            /3)
          </p>
        </div>
        <button
          onClick={() => handleCreate()}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          {t('BUTTON.CreateMaterialRequest')}
        </button>
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedMaterialRequest(null);
          setReviewReadOnly(false);
        }}
        onSave={handleSaveReview}
        review={reviewReadOnly ? selectedMaterialRequest?.review : null}
        serviceRequestID={null}
        materialRequestID={selectedMaterialRequest?.materialRequestID}
        partnerID={
          selectedMaterialRequest?.selectedDistributorApplication.distributorID
        }
        setUploadProgress={setUploadProgress}
        readOnly={reviewReadOnly}
      />
      {/* Empty state */}
      {!materialRequests || materialRequests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <i className="fas fa-boxes text-3xl text-orange-600"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {t('userPage.materialRequest.noRequest')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('userPage.materialRequest.letStart')}
          </p>
          <button
            onClick={() => handleCreate()}
            disabled={isCreating}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-plus"></i>
            {t('BUTTON.CreateServiceRequest')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {materialRequests.map((req) => (
            <div
              key={req.materialRequestID}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                      <i className="fas fa-boxes text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                        {t('Enums.ServiceType.Material')}
                        {' #'}
                        {req.materialRequestID.substring(0, 8)}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-calendar-alt"></i>
                          {formatDate(req.createdAt, i18n.language)}
                        </div>

                        {req.deliveryDate && (
                          <div className="flex items-center gap-1">
                            <i className="fas fa-calendar-alt"></i>
                            {t('userPage.materialRequestDetail.deliveryDate')}
                            {': '}
                            {formatDate(req.deliveryDate, i18n.language)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {req.description?.length > 100
                        ? req.description.slice(0, 100) + '...'
                        : req.description}
                    </p>
                    {/* Address */}
                    {req.address && (
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-location-dot text-orange-500"></i>
                        <span className="text-gray-600">
                          {t('userPage.materialRequest.lbl_address')}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {req.address.detail && `${req.address.detail}, `}
                          {req.address.ward && `${req.address.ward}, `}
                          {req.address.district && `${req.address.district}, `}
                          {req.address.city}
                        </span>
                      </div>
                    )}
                    {/* Material Items */}
                    {req.materialRequestItems?.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-list text-orange-500"></i>
                          {t('userPage.materialRequest.lbl_materialList')} (
                          {req.materialRequestItems.length}{' '}
                          {t('userPage.materialRequest.lbl_materialUnit')})
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {req.materialRequestItems.slice(0, 4).map((item) => (
                            <div
                              key={item.materialRequestItemID}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              <i className="fas fa-cube text-orange-400 text-xs"></i>
                              <span className="font-medium">
                                {i18n.language === 'vi'
                                  ? item.material?.name
                                  : item.material?.nameEN ||
                                    item.material?.name}
                                :
                              </span>
                              <span className="text-black font-semibold">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {req.materialRequestItems.length > 4 && (
                          <div className="text-xs text-gray-500 mt-2 italic">
                            ...{' '}
                            {t('userPage.materialRequest.lbl_andMoreMaterial', {
                              count: req.materialRequestItems.length - 4,
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-500 italic">
                        {t('userPage.materialRequest.lbl_emptyMaterialList')}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={req.status} type="Request" />
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <i className="fas fa-boxes mr-1"></i>
                        {req.distributorApplyCount}{' '}
                        {t('userPage.materialRequest.lbl_distributor')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Detail */}
                      <button
                        className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                        onClick={() => handleViewDetail(req.materialRequestID)}
                      >
                        <i className="fas fa-eye"></i>
                        {t('BUTTON.ViewDetail')}
                      </button>

                      {/* Delete */}
                      {(req.status === 'Opening' || req.status === 'Draft') &&
                        req.selectedDistributorApplicationID == null && (
                          <button
                            className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                            onClick={() => handleDelete(req.materialRequestID)}
                          >
                            <i className="fas fa-xmark"></i>
                            {t('BUTTON.Delete')}
                          </button>
                        )}
                    </div>
                  </div>
                  <ReviewCountdown
                    request={req}
                    application={
                      req.selectedDistributorApplication || { status: null }
                    }
                    onCreateReview={handleCreateReview}
                    onViewReview={handleViewReview}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MaterialRequestManager.propTypes = {
  user: PropTypes.object.isRequired,
};

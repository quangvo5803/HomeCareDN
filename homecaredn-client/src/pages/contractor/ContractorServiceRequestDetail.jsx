import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { contractorService } from '../../services/contractorService';
import { formatVND } from '../../utils/formatters';
import { useAuth } from '../../hook/useAuth';
import { numberToWordsByLang } from '../../utils/numberToWords';
import { uploadImageToCloudinary } from '../../utils/uploadImage';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { PaymentService } from '../../services/paymentService';
import PaymentSuccessModal from '../../components/modal/PaymentSuccessModal';
import PaymentCancelModal from '../../components/modal/PaymentCancelModal';
export default function ContractorServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status');
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getServiceRequestById, loading, deleteServiceRequestImage } =
    useServiceRequest();
  const [serviceRequest, setServiceRequest] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!serviceRequestId || !user?.id) return;

      try {
        setIsChecking(true);
        const data = await getServiceRequestById(serviceRequestId);
        setServiceRequest(data);

        let appData = null;
        const selectedApp = data.selectedContractorApplication;

        if (selectedApp != null && selectedApp.contractorID === user.id) {
          appData = selectedApp;
        } else {
          appData =
            await contractorService.contractorApplication.getContractorApplicationByServiceRequestIDAndContractorID(
              {
                ServiceRequestID: serviceRequestId,
                ContractorID: user.id,
              }
            );
        }

        setExistingApplication(appData || null);
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setIsChecking(false);
      }
    };

    loadData();
  }, [serviceRequestId, user?.id, getServiceRequestById, t]);
  useEffect(() => {
    let timer;
    if (status) {
      if (status.toLowerCase() === 'success') setOpenSuccess(true);
      if (status.toLowerCase() === 'cancelled') setOpenCancel(true);
      timer = setTimeout(() => {
        setOpenSuccess(false);
        setOpenCancel(false);
      }, 3000);
    }

    if (serviceRequest) {
      const vb = new VenoBox({ selector: '.venobox' });
      return () => {
        clearTimeout(timer);
        vb.close();
      };
    }

    return () => clearTimeout(timer);
  }, [status, serviceRequest, existingApplication]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      toast.error(t('ERROR.REQUIRED_CONTRACTOR_APPLY_DESCRIPTION'));
      return;
    }
    if (!estimatePrice) {
      toast.error(t('ERROR.REQUIRED_ESTIMATE_PRICE'));
      return;
    }
    const newFiles = images.filter((i) => i.isNew).map((i) => i.file);
    const payload = {
      ServiceRequestID: serviceRequestId,
      ContractorID: user.id,
      Description: description,
      EstimatePrice: estimatePrice,
    };

    if (images.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }

    try {
      if (newFiles.length > 0) {
        setUploadProgress(1);
        const uploaded = await uploadImageToCloudinary(
          newFiles,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          (percent) => setUploadProgress(percent),
          'HomeCareDN/ContractorAppication'
        );
        const uploadedArray = Array.isArray(uploaded) ? uploaded : [uploaded];
        payload.ImageUrls = uploadedArray.map((u) => u.url);
        payload.ImagePublicIds = uploadedArray.map((u) => u.publicId);
        setUploadProgress(0);
      }

      const appData =
        await contractorService.contractorApplication.createContractorApplication(
          payload
        );
      toast.success(t('SUCCESS.APPLICATION_CREATE'));

      setExistingApplication(appData);
    } catch (error) {
      setUploadProgress(0);
      toast.error(t(handleApiError(error)));
    }
  };

  const handleDeleteApplication = () => {
    if (!existingApplication) return;
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteApplicationModal.title',
      textKey: 'ModalPopup.DeleteApplicationModal.text',
      onConfirm: async () => {
        try {
          await contractorService.contractorApplication.deleteApplication(
            existingApplication.contractorApplicationID
          );
          Swal.close();
          toast.success(t('SUCCESS.DELETE_APPLICATION'));
          setExistingApplication(null);
          setDescription('');
          setEstimatePrice('');
          setImages([]);
        } catch (err) {
          toast.error(t(handleApiError(err)));
        }
      },
    });
  };

  const handlePayCommission = async () => {
    try {
      toast.info(t('contractorServiceRequestDetail.processingPayment'));
      const result = await PaymentService.createPayCommission({
        contractorApplicationID: existingApplication.contractorApplicationID,
        serviceRequestID: serviceRequestId,
        amount: Number(existingApplication.estimatePrice) * 0.006,
        description: serviceRequestId.slice(0, 19),
        itemName: 'Service Request Commission',
      });

      if (result?.checkoutUrl) {
        globalThis.location.href = result.checkoutUrl;
      } else {
        toast.error(t('contractorServiceRequestDetail.paymentFailed'));
      }
    } catch (err) {
      toast.error(err?.message || 'Lỗi thanh toán');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const handleRemoveImage = (img) => {
    if (img.isNew) {
      removeImageFromState(img);
    } else {
      showDeleteModal({
        t,
        titleKey: t('ModalPopup.DeleteImageModal.title'),
        textKey: t('ModalPopup.DeleteImageModal.text'),
        onConfirm: async () => {
          try {
            await deleteServiceRequestImage(serviceRequestId, img.url);
            Swal.close();
            toast.success(t('SUCCESS.DELETE'));
            removeImageFromState(img);
          } catch (err) {
            handleApiError(err, t);
          }
        },
      });
    }
  };

  const removeImageFromState = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };

  if (loading || isChecking) return <Loading />;
  if (!serviceRequest)
    return (
      <div className="px-4 py-8 text-center text-gray-600">
        {t('contractorServiceRequestDetail.serviceRequestNotFound')}
      </div>
    );
  if (uploadProgress) return <Loading progress={uploadProgress} />;

  const baseArea = (serviceRequest?.width ?? 0) * (serviceRequest?.length ?? 0);
  const totalArea = (baseArea * (serviceRequest?.floors ?? 1)).toFixed(1);

  const addressText = [
    serviceRequest?.address?.detail,
    serviceRequest?.address?.ward,
    serviceRequest?.address?.district,
    serviceRequest?.address?.city,
  ]
    .filter(Boolean)
    .join(', ');

  // Pending Commission
  const renderApplicationContent = () => {
    if (!existingApplication) return null;

    if (existingApplication.status === 'PendingCommission') {
      return (
        // --- JSX của trạng thái PendingCommission ---
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-green-200 p-6 lg:sticky lg:top-24 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-green-600 inline-flex items-center gap-2">
              <i className="fas fa-trophy text-yellow-500" />
              {t('contractorServiceRequestDetail.youAreSelected')}
            </h3>
            <StatusBadge
              status={serviceRequest?.selectedContractorApplication?.status}
              type="Application"
            />
          </div>

          {/* Thông tin khách hàng */}
          <div className="space-y-3 rounded-lg ring-1 ring-gray-200 p-4 bg-gray-50/70">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i className="fas fa-user text-green-600" />
              {t('contractorServiceRequestDetail.customerInfo')}
            </h4>
            <p className="text-sm text-gray-700">
              <i className="fas fa-user-circle mr-2 text-gray-400" />
              <strong>{serviceRequest.customerName}</strong>
            </p>
            <p className="text-sm text-gray-700">
              <i className="fas fa-envelope mr-2 text-gray-400" />
              {serviceRequest.customerEmail}
            </p>
            <p className="text-sm text-gray-700">
              <i className="fas fa-phone-alt mr-2 text-gray-400" />
              {serviceRequest.customerPhone}
            </p>
          </div>

          {/* Thông tin báo giá */}
          <div className="rounded-lg ring-1 ring-gray-200 p-3 bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <i className="fas fa-coins mr-2" />
              {t('contractorServiceRequestDetail.yourBid')}
            </label>
            <p className="text-lg font-bold text-gray-900">
              {formatVND(existingApplication.estimatePrice)}
            </p>
          </div>

          {/* Ghi chú */}
          <div className="rounded-lg ring-1 ring-gray-200 p-3 bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <i className="fas fa-comment-alt mr-2" />
              {t('contractorServiceRequestDetail.yourNote')}
            </label>
            <p className="text-gray-700 bg-white p-3 rounded-md whitespace-pre-wrap ring-1 ring-gray-200">
              {existingApplication.description}
            </p>
          </div>

          {/* Hình ảnh */}
          {existingApplication.imageUrls?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-600">
                  <i className="fas fa-images mr-2" />
                  {t('contractorServiceRequestDetail.yourImages')}
                </label>
                <span className="text-xs text-gray-500">
                  {existingApplication.imageUrls.length} ảnh
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {existingApplication.imageUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    className="venobox aspect-square rounded-md overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-green-500 ring-1 ring-gray-200 bg-white p-1"
                    data-gall="application-gallery"
                  >
                    <img
                      src={url}
                      alt={t('contractorServiceRequestDetail.appliedImage')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Nút thanh toán */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handlePayCommission}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-hand-holding-usd" />
              {t('contractorServiceRequestDetail.payCommission')}
            </button>
            <p className="mt-3 text-xs text-gray-500 text-center">
              <i className="fas fa-info-circle mr-1" />
              {t('contractorServiceRequestDetail.statusOpen')}?{' '}
              {t(
                'contractorServiceRequestDetail.selectedPendingCommissionNote'
              )}
            </p>
          </div>
        </div>
      );
    }

    // --- Applied ---
    return (
      <div className="bg-white rounded-2xl shadow-lg ring-1 ring-blue-200 p-6 lg:sticky lg:top-24 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
            <i className="fas fa-check-circle" />
            {t('contractorServiceRequestDetail.appliedTitle')}
          </h3>
          <StatusBadge status={existingApplication.status} type="Application" />
        </div>

        <div className="rounded-lg ring-1 ring-gray-200 p-3 bg-gray-50/50">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <i className="fas fa-coins mr-2" />
            {t('contractorServiceRequestDetail.yourBid')}
          </label>
          <p className="text-lg font-bold text-gray-900">
            {formatVND(existingApplication.estimatePrice)}
          </p>
        </div>

        <div className="rounded-lg ring-1 ring-gray-200 p-3 bg-gray-50/50">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            <i className="fas fa-comment-alt mr-2" />
            {t('contractorServiceRequestDetail.yourNote')}
          </label>
          <p className="text-gray-700 bg-white p-3 rounded-md whitespace-pre-wrap ring-1 ring-gray-200">
            {existingApplication.description}
          </p>
        </div>

        {existingApplication.imageUrls?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-600">
                <i className="fas fa-images mr-2" />
                {t('contractorServiceRequestDetail.yourImages')}
              </label>
              <span className="text-xs text-gray-500">
                {existingApplication.imageUrls.length} ảnh
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {existingApplication.imageUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  className="venobox aspect-square rounded-md overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-blue-500 ring-1 ring-gray-200 bg-white p-1"
                  data-gall="application-gallery"
                >
                  <img
                    src={url}
                    alt={t('contractorServiceRequestDetail.appliedImage')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {existingApplication.status === 'Pending' && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteApplication}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-alt" />
              {t('contractorServiceRequestDetail.deleteApplication')}
            </button>
            <p className="mt-3 text-xs text-gray-500 text-center">
              <i className="fas fa-info-circle mr-1" />
              {t('contractorServiceRequestDetail.statusOpen')}?{' '}
              {t('contractorServiceRequestDetail.applyFormTitle')}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/Contractor/service-requests')}
          className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <i className="fas fa-arrow-left mr-2" />
          {t('contractorServiceRequestDetail.backToList')}
        </button>
      </div>

      {/* HERO SUMMARY */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="px-6 py-6 sm:px-8 sm:py-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold inline-flex items-center gap-3 justify-center">
              <i className="fas fa-clipboard-list opacity-90" />
              {t('contractorServiceRequestDetail.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Specs card */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-screwdriver-wrench mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.serviceType')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-box-open mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.packageOption')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.PackageOption.${serviceRequest.packageOption}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-building mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.buildingType')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.BuildingType.${serviceRequest.buildingType}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-cubes mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.structureType')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(
                      `Enums.MainStructure.${serviceRequest.mainStructureType}`
                    )}
                  </p>
                </div>
                {serviceRequest.designStyle && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      <i className="fas fa-palette mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.designStyle')}
                    </label>
                    <p className="text-gray-900 font-medium">
                      {t(`Enums.DesignStyle.${serviceRequest.designStyle}`)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-th-large mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.floors')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {serviceRequest.floors}{' '}
                    {t('contractorServiceRequestDetail.floorsUnit')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions & Estimate row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dimensions */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-ruler-combined text-gray-500" />
                  {t('contractorServiceRequestDetail.dimensions')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <i className="fas fa-arrows-alt-h mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.width')}
                    </label>
                    <p className="text-gray-900">{serviceRequest.width} m</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <i className="fas fa-arrows-alt-v mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.length')}
                    </label>
                    <p className="text-gray-900">{serviceRequest.length} m</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      <i className="fas fa-expand-arrows-alt mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.totalArea')}
                    </label>
                    <p className="text-xl font-bold text-orange-600">
                      {totalArea} m²
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-orange-200">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-dollar-sign text-orange-500" />
                  {t('contractorServiceRequestDetail.estimatePrice')}
                </h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {serviceRequest.estimatePrice != 0
                    ? formatVND(serviceRequest.estimatePrice)
                    : t('contractorServiceRequestManager.negotiable')}
                </p>
                {serviceRequest.estimatePrice != 0 && (
                  <p className="text-sm text-gray-600 mb-1">
                    {numberToWordsByLang(serviceRequest.estimatePrice)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address & Description row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            {serviceRequest.address && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-gray-500" />
                    {t('contractorServiceRequestDetail.address')}
                  </h3>
                  <p className="text-gray-900" title={addressText}>
                    {addressText}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-align-left text-gray-500" />
                  {t('contractorServiceRequestDetail.description')}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {serviceRequest.description}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          {serviceRequest.imageUrls && serviceRequest.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-images text-gray-500" />
                  {t('contractorServiceRequestDetail.images')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {serviceRequest.imageUrls.map((imageUrl) => (
                    <a
                      key={imageUrl}
                      href={imageUrl}
                      className="venobox aspect-square rounded-lg overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-orange-500 ring-1 ring-gray-200"
                      data-gall="service-request-gallery"
                    >
                      <img
                        src={imageUrl}
                        alt={t(
                          'contractorServiceRequestDetail.serviceRequestImage'
                        )}
                        className="object-cover w-full h-full  group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                <i className="fas fa-info-circle text-gray-500" />
                {t('contractorServiceRequestDetail.applicationStatus')}
              </h3>
              <div className="rounded-lg p-4 ring-1 ring-gray-200 bg-gray-50">
                <StatusBadge status={serviceRequest.status} type="Request" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Apply Form or Applied Details */}
        <div className="lg:col-span-4">
          {/* Nếu chưa apply → hiện Apply Form */}
          {!existingApplication && (
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 lg:sticky lg:top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 ring-4 ring-green-100">
                  <i className="fas fa-clipboard-list text-green-600" />
                </span>
                {t('contractorServiceRequestDetail.applyFormTitle')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bid Price */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-coins text-orange-500 mr-2"></i>
                    {t('contractorServiceRequestDetail.bidPrice')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={estimatePrice}
                    onChange={(e) => setEstimatePrice(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={
                      serviceRequest.estimatePrice
                        ? t(
                            'contractorServiceRequestDetail.bidPricePlaceholderWithEst',
                            {
                              est: formatVND(serviceRequest.estimatePrice),
                            }
                          )
                        : t(
                            'contractorServiceRequestDetail.bidPricePlaceholder'
                          )
                    }
                  />

                  {estimatePrice && (
                    <>
                      <p className="text-sm text-gray-500">
                        {t('contractorServiceRequestDetail.bidPriceLabel')}{' '}
                        <span className="font-semibold text-orange-600">
                          {formatVND(Number(estimatePrice))}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('contractorServiceRequestDetail.bidPriceInWords')}{' '}
                        <span className="font-semibold">
                          {numberToWordsByLang(Number(estimatePrice))}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Note */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <i className="fas fa-comment-alt mr-2 text-gray-500" />
                      {t('contractorServiceRequestDetail.noteToOwner')}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <span className="text-xs text-gray-400">
                      {description.length}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      'contractorServiceRequestDetail.notePlaceholder'
                    )}
                    aria-label={t('contractorServiceRequestDetail.noteToOwner')}
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Images */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <i className="fas fa-images text-orange-500 mr-2"></i>
                      {t('userPage.createServiceRequest.form_images')}
                    </label>
                    <span className="text-xs text-gray-500">
                      {images.length}/5
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload images"
                    />
                    <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                        <i className="fas fa-cloud-upload-alt text-orange-500 text-xl"></i>
                      </div>
                      <p className="text-gray-600 text-center mb-2">
                        <span className="font-semibold text-orange-600">
                          {t('upload.clickToUpload')}
                        </span>{' '}
                        {t('upload.orDragAndDrop')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('upload.fileTypesHint')}
                      </p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={img.url}
                          className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors ring-1 ring-gray-200"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                              aria-label="Remove image"
                            >
                              <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !estimatePrice.trim() ||
                      !description.trim() ||
                      images.length == 0
                    }
                  >
                    <i className="fas fa-paper-plane" />
                    {t('contractorServiceRequestDetail.applyForProject')}
                  </button>
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    <i className="fas fa-shield-alt mr-1" />
                    {t('contractorServiceRequestDetail.privacyNotice')}
                  </p>
                </div>
              </form>
            </div>
          )}
          {/* Nếu đã apply (bất kỳ trạng thái nào) → hiện renderApplicationContent */}
          {existingApplication && renderApplicationContent()}
        </div>
      </div>
      <PaymentSuccessModal
        open={openSuccess}
        onClose={() => setOpenSuccess(false)}
      />
      <PaymentCancelModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
      />
    </div>
  );
}

<<<<<<< HEAD
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
=======
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
>>>>>>> develop
import { useTranslation } from 'react-i18next';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { contractorService } from '../../services/contractorService';
import { formatVND } from '../../utils/formatters';
import { useAuth } from '../../hook/useAuth';
import { numberToWordsByLang } from '../../utils/numberToWords';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
<<<<<<< HEAD

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

=======
import { PaymentService } from '../../services/paymentService';
import PaymentSuccessModal from '../../components/modal/PaymentSuccessModal';
import PaymentCancelModal from '../../components/modal/PaymentCancelModal';
>>>>>>> develop
export default function ContractorServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const [searchParams] = useSearchParams();
  const statusShownRef = useRef(false);

  const status = searchParams.get('status');
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    getServiceRequestById,
    loading,
    deleteServiceRequestImage,
    deleteServiceRequestDocument,
  } = useServiceRequest();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [description, setDescription] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');

<<<<<<< HEAD
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageProgress, setImageProgress] = useState({ loaded: 0, total: 0 });
  const [documentProgress, setDocumentProgress] = useState({
    loaded: 0,
    total: 0,
  });

  // upload docs and imgs progress
  useEffect(() => {
    const totalLoaded = imageProgress.loaded + documentProgress.loaded;
    const totalSize = imageProgress.total + documentProgress.total;

    if (totalSize === 0) {
      if (uploadProgress !== 1) setUploadProgress(0);
      return;
    }

    const percent = Math.min(100, Math.round((totalLoaded * 100) / totalSize));
    setUploadProgress(percent);
  }, [imageProgress, documentProgress, uploadProgress]);

  // Load data
=======
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

>>>>>>> develop
  useEffect(() => {
    const loadData = async () => {
      if (!serviceRequestId || !user?.id) return;

      try {
        setIsChecking(true);
<<<<<<< HEAD
        const serviceRequestData = await getServiceRequestById(
          serviceRequestId
        );
        setServiceRequest(serviceRequestData);
        const existingApplicationData =
          await contractorApplicationService.getApplication({
            ServiceRequestID: serviceRequestId,
            ContractorID: user.id,
          });
        setExistingApplication(existingApplicationData);
=======
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
>>>>>>> develop
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setIsChecking(false);
      }
    };
<<<<<<< HEAD
    loadData();
  }, [serviceRequestId, getServiceRequestById, user?.id, t]);

  // Init VenoBox khi gallery thay đổi
  useEffect(() => {
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  }, [
    serviceRequest?.imageUrls?.length,
    existingApplication?.imageUrls?.length,
  ]);
=======

    loadData();
  }, [serviceRequestId, user?.id, getServiceRequestById, t]);
  useEffect(() => {
    if (!status || statusShownRef.current) return;

    if (status.toLowerCase() === 'paid') setOpenSuccess(true);
    if (status.toLowerCase() === 'cancelled') setOpenCancel(true);

    statusShownRef.current = true;

    const timer = setTimeout(() => {
      setOpenSuccess(false);
      setOpenCancel(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    if (serviceRequest) {
      const vb = new VenoBox({ selector: '.venobox' });
      return () => {
        vb.close();
      };
    }
  }, [serviceRequest, existingApplication]);
>>>>>>> develop

  // Clean up object URLs khi unmount
  useEffect(() => {
    return () => {
      images.forEach(
        (i) =>
          i.isNew && i.url?.startsWith('blob:') && URL.revokeObjectURL(i.url)
      );
      documents.forEach(
        (d) =>
          d.isNew && d.url?.startsWith('blob:') && URL.revokeObjectURL(d.url)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseArea = useMemo(
    () => (serviceRequest?.width ?? 0) * (serviceRequest?.length ?? 0),
    [serviceRequest?.width, serviceRequest?.length]
  );
  const totalArea = useMemo(
    () => baseArea * (serviceRequest?.floors ?? 1),
    [baseArea, serviceRequest?.floors]
  );

  const addressText = useMemo(
    () =>
      [
        serviceRequest?.address?.detail,
        serviceRequest?.address?.ward,
        serviceRequest?.address?.district,
        serviceRequest?.address?.city,
      ]
        .filter(Boolean)
        .join(', '),
    [
      serviceRequest?.address?.detail,
      serviceRequest?.address?.ward,
      serviceRequest?.address?.district,
      serviceRequest?.address?.city,
    ]
  );

<<<<<<< HEAD
  const revokeIfBlob = (url) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const removeImageFromState = useCallback((img) => {
    setImages((prev) => {
      revokeIfBlob(img.url);
      return prev.filter((i) => i.url !== img.url);
=======
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
>>>>>>> develop
    });
  }, []);

<<<<<<< HEAD
  const removeDocumentFromState = useCallback((doc) => {
    setDocuments((prev) => {
      revokeIfBlob(doc.url);
      return prev.filter((d) => d.url !== doc.url);
    });
  }, []);

  const handleImageChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length + images.length > MAX_IMAGES) {
        toast.error(t('ERROR.MAXIMUM_IMAGE'));
        return;
      }
      const mapped = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isNew: true,
        name: file.name,
      }));
      setImages((prev) => [...prev, ...mapped]);
    },
    [images.length, t]
  );
=======
  const handlePayCommission = async () => {
    try {
      toast.info(t('contractorServiceRequestDetail.processingPayment'));
      const estimatePrice = Number(existingApplication.estimatePrice);

      let commission = 0;

      if (estimatePrice <= 500_000_000) {
        commission = estimatePrice * 0.02;
      } else if (estimatePrice <= 2_000_000_000) {
        commission = estimatePrice * 0.015;
      } else {
        commission = estimatePrice * 0.01;
        if (commission > 100_000_000) commission = 100_000_000;
      }
      const result = await PaymentService.createPayCommission({
        contractorApplicationID: existingApplication.contractorApplicationID,
        serviceRequestID: serviceRequestId,
        amount: commission,
        description: serviceRequestId.slice(0, 19),
        itemName: 'Service Request Commission',
      });
>>>>>>> develop

  const handleDocumentChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length + documents.length > MAX_DOCUMENTS) {
        toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
        return;
      }
      const mapped = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isNew: true,
        name: file.name,
      }));
      setDocuments((prev) => [...prev, ...mapped]);
    },
    [documents.length, t]
  );

  const handleRemoveImage = useCallback(
    (img) => {
      if (img.isNew) {
        removeImageFromState(img);
      } else {
        showDeleteModal({
          t,
          // giữ nguyên cách truyền tham số theo code gốc
          titleKey: t('ModalPopup.DeleteImageModal.title'),
          textKey: t('ModalPopup.DeleteImageModal.text'),
          onConfirm: async () => {
            try {
              await deleteServiceRequestImage(serviceRequestId, img.url);
              Swal.close();
              toast.success(t('SUCCESS.DELETE'));
              removeImageFromState(img);
            } catch (err) {
              toast.error(t(handleApiError(err)));
            }
          },
        });
      }
    },
    [deleteServiceRequestImage, removeImageFromState, serviceRequestId, t]
  );

  const handleRemoveDocument = useCallback(
    (doc) => {
      if (doc.isNew) {
        removeDocumentFromState(doc);
      } else {
        showDeleteModal({
          t,
          // giữ nguyên như code gốc
          titleKey: t('ModalPopup.DeleteDocumentModal.title'),
          textKey: t('ModalPopup.DeleteDocumentModal.text'),
          onConfirm: async () => {
            try {
              await deleteServiceRequestDocument(serviceRequestId, doc.url);
              Swal.close();
              toast.success(t('SUCCESS.DELETE'));
              removeDocumentFromState(doc);
            } catch (err) {
              toast.error(t(handleApiError(err)));
            }
          },
        });
      }
    },
    [deleteServiceRequestDocument, removeDocumentFromState, serviceRequestId, t]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!description) {
        toast.error(t('ERROR.REQUIRED_CONTRACTOR_APPLY_DESCRIPTION'));
        return;
      }
      if (!estimatePrice) {
        toast.error(t('ERROR.REQUIRED_ESTIMATE_PRICE'));
        return;
      }
      if (images.length > MAX_IMAGES) {
        toast.error(t('ERROR.MAXIMUM_IMAGE'));
        return;
      }
      if (documents.length > MAX_DOCUMENTS) {
        toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
        return;
      }
<<<<<<< HEAD

      const newImageFiles = images.filter((i) => i.isNew).map((i) => i.file);
      const newDocumentFiles = documents
        .filter((i) => i.isNew)
        .map((i) => i.file);
=======
    } catch (err) {
      toast.error(err?.message || 'Lỗi thanh toán');
    }
  };
>>>>>>> develop

      const payload = {
        ServiceRequestID: serviceRequestId,
        ContractorID: user?.id,
        Description: description,
        EstimatePrice: estimatePrice,
      };

      try {
        setImageProgress({
          loaded: 0,
          total: newImageFiles.reduce((sum, f) => sum + f.size, 0),
        });
        setDocumentProgress({
          loaded: 0,
          total: newDocumentFiles.reduce((sum, f) => sum + f.size, 0),
        });

        if (newImageFiles.length > 0 || newDocumentFiles.length > 0) {
          setUploadProgress(1);
        }

        const imageUploadPromise =
          newImageFiles.length > 0
            ? uploadToCloudinary(
                newImageFiles,
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                (progress) => setImageProgress(progress),
                'HomeCareDN/ContractorAppication'
              )
            : Promise.resolve(null);

        const documentUploadPromise =
          newDocumentFiles.length > 0
            ? uploadToCloudinary(
                newDocumentFiles,
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                (progress) => setDocumentProgress(progress),
                'HomeCareDN/ContractorAppication/Documents',
                'raw'
              )
            : Promise.resolve(null);

        const [imageResults, documentResults] = await Promise.all([
          imageUploadPromise,
          documentUploadPromise,
        ]);

        if (imageResults) {
          const arr = Array.isArray(imageResults)
            ? imageResults
            : [imageResults];
          payload.ImageUrls = arr.map((u) => u.url);
          payload.ImagePublicIds = arr.map((u) => u.publicId);
        }

        if (documentResults) {
          const arr = Array.isArray(documentResults)
            ? documentResults
            : [documentResults];
          payload.DocumentUrls = arr.map((u) => u.url);
          payload.DocumentPublicIds = arr.map((u) => u.publicId);
        }

        await contractorApplicationService.createContractorApplication(payload);
        toast.success(t('SUCCESS.APPICATION_CREATE'));

        const appData = await contractorApplicationService.getApplication({
          serviceRequestId: serviceRequestId,
          contractorId: user?.id,
        });
        setExistingApplication(appData);
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setUploadProgress(0);
        setImageProgress({ loaded: 0, total: 0 });
        setDocumentProgress({ loaded: 0, total: 0 });
      }
    },
    [
      description,
      documents,
      estimatePrice,
      images,
      serviceRequestId,
      t,
      user?.id,
    ]
  );
  if (loading || isChecking) return <Loading />;
  if (!serviceRequest)
    return (
      <div className="px-4 py-8 text-center text-gray-600">
        {t('contractorServiceRequestDetail.serviceRequestNotFound')}
      </div>
    );
  if (uploadProgress) return <Loading progress={uploadProgress} />;

<<<<<<< HEAD
  const {
    serviceType,
    packageOption,
    buildingType,
    mainStructureType,
    designStyle,
    floors,
  } = serviceRequest || {};
=======
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
              onClick={() => handlePayCommission()}
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
>>>>>>> develop

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
                    {t(`Enums.ServiceType.${serviceType}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-box-open mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.packageOption')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.PackageOption.${packageOption}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-building mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.buildingType')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.BuildingType.${buildingType}`)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-cubes mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.structureType')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {t(`Enums.MainStructure.${mainStructureType}`)}
                  </p>
                </div>
                {designStyle && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      <i className="fas fa-palette mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.designStyle')}
                    </label>
                    <p className="text-gray-900 font-medium">
                      {t(`Enums.DesignStyle.${designStyle}`)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-th-large mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.floors')}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {floors} {t('contractorServiceRequestDetail.floorsUnit')}
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
                {serviceRequest.estimatePrice === 0
                  ? t('contractorServiceRequestManager.negotiable')
                  : formatVND(serviceRequest.estimatePrice)}

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
          {serviceRequest.imageUrls?.length > 0 && (
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

          {/* Documents */}
          {serviceRequest.documentUrls?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-6 py-5">
                {/* Tiêu đề (giữ nguyên) */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-file-alt text-gray-500" />
                  {t('contractorServiceRequestDetail.documents')}
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
                <StatusBadge status={serviceRequest.status} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Apply Form or Applied Details */}
        <div className="lg:col-span-4">
          {existingApplication ? (
            // Applied
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-blue-200 p-6 lg:sticky lg:top-24 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
                  <i className="fas fa-check-circle" />
                  {t('contractorServiceRequestDetail.appliedTitle')}
                </h3>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                  <i className="fas fa-paper-plane" />
                  {t('BUTTON.View')}
                </span>
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
                      {existingApplication.imageUrls.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {existingApplication.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        className="venobox aspect-square rounded-md overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-blue-500 ring-1 ring-gray-200 bg-white p-1"
                        data-gall="application-gallery"
                        aria-label={t(
                          'contractorServiceRequestDetail.appliedImage'
                        )}
                        title={t('contractorServiceRequestDetail.viewFullSize')}
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

              {existingApplication.documentUrls?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600">
                      <i className="fas fa-file-alt mr-2" />
                      {t('contractorServiceRequestDetail.yourDocuments')}
                    </label>
                    <span className="text-xs text-gray-500">
                      {existingApplication.documentUrls.length}{' '}
                      {t('common.files')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {existingApplication.documentUrls.map((docUrl) => {
                      const fileName = decodeURIComponent(
                        docUrl.split('/').pop()?.split('?')[0] ?? 'document'
                      );
                      const ext = (
                        fileName.includes('.') ? fileName.split('.').pop() : ''
                      ).toLowerCase();

                      // Logic chọn icon từ UI mẫu
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

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!existingApplication) return;
                    showDeleteModal({
                      t,
                      titleKey: 'ModalPopup.DeleteApplicationModal.title',
                      textKey: 'ModalPopup.DeleteApplicationModal.text',
                      onConfirm: async () => {
                        try {
                          await contractorApplicationService.deleteApplication(
                            existingApplication.contractorApplicationID
                          );
                          Swal.close();
                          toast.success(t('SUCCESS.DELETE_APPLICATION'));
                          setExistingApplication(null);
                          setDescription('');
                          setEstimatePrice('');
                          setImages([]);
                          setDocuments([]);
                        } catch (err) {
                          toast.error(t(handleApiError(err)));
                        }
                      },
                    });
                  }}
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
            </div>
          ) : (
            // Apply form
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
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                      {images.length}/{MAX_IMAGES}
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

                {/* Documents */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <i className="fas fa-file-alt text-orange-500 mr-2"></i>
                      {t('userPage.createServiceRequest.form_documents')}
                    </label>
                    <span className="text-xs text-gray-500">
                      {documents.length}/{MAX_DOCUMENTS}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept={ACCEPTED_DOC_TYPES}
                      multiple
                      onChange={handleDocumentChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label={t('upload.uploadDocuments')}
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

                  {documents.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.url}
                          className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors ring-1 ring-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2 text-center"
                        >
                          <i className="fas fa-file-alt text-4xl text-gray-400 mb-2"></i>
                          <p className="text-xs text-gray-600 break-all truncate">
                            {doc.name || ''}
                          </p>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                              aria-label="Remove document"
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

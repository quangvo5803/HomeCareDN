import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import { formatVND, formatDate } from '../../utils/formatters';
import { numberToWordsByLang } from '../../utils/numberToWords';
import { useAuth } from '../../hook/useAuth';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { paymentService } from '../../services/paymentService';
import PaymentSuccessModal from '../../components/modal/PaymentSuccessModal';
import PaymentCancelModal from '../../components/modal/PaymentCancelModal';
import CommissionCountdown from '../../components/partner/CommissionCountdown';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import ChatSection from '../../components/ChatSection';
//For TINY MCE
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/code';
import detectSensitiveInfo from '../../utils/detectSensitiveInfo';
import { extractFileText } from '../../utils/extractFileText';
//For TINY MCE

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

export default function ContractorServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const [searchParams] = useSearchParams();
  const statusShownRef = useRef(false);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setServiceRequests, getServiceRequestById, loading } =
    useServiceRequest();
  const [serviceRequest, setServiceRequest] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(null);
  const [estimatePrice, setEstimatePrice] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [imageProgress, setImageProgress] = useState({ loaded: 0, total: 0 });
  const [documentProgress, setDocumentProgress] = useState({
    loaded: 0,
    total: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // upload docs and imgs progress
  useEffect(() => {
    const totalLoaded = imageProgress.loaded + documentProgress.loaded;
    const totalSize = imageProgress.total + documentProgress.total;

    if (totalSize === 0) {
      setUploadProgress(0);
      return;
    }

    const percent = Math.min(100, Math.round((totalLoaded * 100) / totalSize));
    setUploadProgress(percent);
  }, [imageProgress, documentProgress, uploadProgress]);
  // Realtime SignalR
  useRealtime({
    //Accept
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
      setServiceRequest((prev) => ({
        ...prev,
        status: 'Closed',
      }));
      setExistingApplication((prev) => ({
        ...prev,
        status: 'PendingCommission',
        dueCommisionTime: payload?.dueCommisionTime || null,
      }));
    },
    //Reject
    [RealtimeEvents.ContractorApplicationRejected]: () => {
      setExistingApplication((prev) => ({
        ...prev,
        status: 'Rejected',
      }));
    },
    //Delete
    [RealtimeEvents.ServiceRequestDelete]: (payload) => {
      if (payload.serviceRequestID === serviceRequestId) {
        navigate('/Contractor/ServiceRequestManager');
        toast.info(t('contractorServiceRequestDetail.realTime'));
      }
    },
  });
  // Load service request & existing application
  useEffect(() => {
    const loadData = async () => {
      if (!serviceRequestId || !user?.id) return;

      try {
        setIsChecking(true);
        const data = await getServiceRequestById(serviceRequestId);
        setServiceRequest(data);
        setTotalApplications(data?.contractorApplyCount ?? 0);
        let appliedContractorApplication =
          await contractorApplicationService.getByServiceRequestIdForContractor(
            {
              ServiceRequestID: serviceRequestId,
              ContractorID: user.id,
            }
          );

        let appData = null;
        if (appliedContractorApplication) {
          appData = appliedContractorApplication;
        }

        if (data.selectedContractorApplication) {
          const selected = data.selectedContractorApplication;
          if (
            selected.contractorID === user.id &&
            ['Approved', 'PendingCommission'].includes(selected.status)
          ) {
            appData = selected;
          }
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

  // Handle query status
  const status = searchParams.get('status');
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
    const timeout = setTimeout(() => {
      if (!serviceRequest && !loading) {
        navigate('/Customer', {
          state: { tab: 'service_requests' },
        });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [serviceRequest, loading, navigate]);

  // Init VenoBox
  useEffect(() => {
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  }, [
    serviceRequest?.imageUrls?.length,
    existingApplication?.imageUrls?.length,
  ]);
  // Clean up object URLs khi unmount
  useEffect(() => {
    return () => {
      // Đổi thành for of
      for (const i of images) {
        if (i.isNew && i.url?.startsWith('blob:')) {
          URL.revokeObjectURL(i.url);
        }
      }

      for (const d of documents) {
        if (d.isNew && d.url?.startsWith('blob:')) {
          URL.revokeObjectURL(d.url);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Submit contractor application
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
    if (images.length > MAX_IMAGES) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    if (documents.length > MAX_DOCUMENTS) {
      toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
      return;
    }
    setIsSubmitting(true);

    const newImageFiles = images.filter((i) => i.isNew).map((i) => i.file);
    const newDocumentFiles = documents
      .filter((i) => i.isNew)
      .map((i) => i.file);

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
        const arr = Array.isArray(imageResults) ? imageResults : [imageResults];
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

      const appData = await contractorApplicationService.create(payload);
      toast.success(t('SUCCESS.APPLICATION_CREATE'));

      setExistingApplication(appData);
      setTotalApplications(totalApplications + 1);

      setDescription('');
      setEstimatePrice('');
      setImages([]);
      setDocuments([]);
    } catch (error) {
      setUploadProgress(0);
      toast.error(t(handleApiError(error)));
    } finally {
      setUploadProgress(0);
      setImageProgress({ loaded: 0, total: 0 });
      setDocumentProgress({ loaded: 0, total: 0 });
      setIsSubmitting(false);
    }
  };

  // Delete application
  const handleDeleteApplication = () => {
    if (!existingApplication) return;

    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteApplicationModal.title',
      textKey: 'ModalPopup.DeleteApplicationModal.text',
      onConfirm: async () => {
        try {
          await contractorApplicationService.delete(
            existingApplication.contractorApplicationID
          );
          Swal.close();
          toast.success(t('SUCCESS.DELETE_APPLICATION'));
          setExistingApplication(null);
          setDescription('');
          setEstimatePrice('');
          setImages([]);
          setDocuments([]);
          setTotalApplications(totalApplications - 1);
        } catch (err) {
          toast.error(t(handleApiError(err)));
        }
      },
    });
  };

  // Pay commission
  const handlePayCommission = async () => {
    try {
      toast.info(t('contractorServiceRequestDetail.processingPayment'));

      const estimatePrice = Number(existingApplication.estimatePrice);
      let commission = 0;

      if (estimatePrice <= 500_000_000) commission = estimatePrice * 0.02;
      else if (estimatePrice <= 2_000_000_000)
        commission = estimatePrice * 0.015;
      else {
        commission = estimatePrice * 0.01;
        if (commission > 100_000_000) commission = 100_000_000;
      }

      const result = await paymentService.createPayCommission({
        contractorApplicationID: existingApplication.contractorApplicationID,
        serviceRequestID: serviceRequestId,
        role: user.role,
        amount: commission,
        description: serviceRequestId.slice(0, 19),
        itemName: 'Service Request Commission',
      });

      if (result?.checkoutUrl) globalThis.location.href = result.checkoutUrl;
      else toast.error(t('contractorServiceRequestDetail.paymentFailed'));
    } catch (err) {
      toast.error(err?.message || 'Lỗi thanh toán');
    }
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (description) {
        const plainText =
          new DOMParser().parseFromString(description, 'text/html').body
            .textContent || '';
        const errorMsg = detectSensitiveInfo(plainText);
        setDescriptionError(errorMsg);
      } else {
        setDescriptionError(null);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [description]);
  // Image handlers
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    const validFiles = [];
    const toastId = toast.loading(t('common.scanDocument'));

    for (const file of files) {
      const content = await extractFileText(file);
      const error = detectSensitiveInfo(content);

      if (error) {
        toast.error(`${file.name} - ${t(error)}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = ''; // reset input
      return;
    }
    toast.dismiss(toastId);

    const mapped = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages((prev) => [...prev, ...mapped]);
  };
  const handleRemoveImage = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };

  const handleRemoveDocument = (doc) => {
    setDocuments((prev) => prev.filter((d) => d.url !== doc.url));
  };
  const handleDocumentChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + documents.length > 5) {
      toast.error(t('ERROR.MAXIMUM_DOCUMENTS'));
      return;
    }
    const validFiles = [];
    const toastId = toast.loading(t('common.scanDocument'));

    for (const file of files) {
      const content = await extractFileText(file);
      const error = detectSensitiveInfo(content);

      if (error) {
        toast.error(`${file.name} - ${t(error)}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = ''; // reset input
      return;
    }
    toast.dismiss(toastId);

    const mapped = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
      name: file.name,
    }));

    setDocuments((prev) => [...prev, ...mapped]);
  };
  const getDocumentIcon = (fileName) => {
    if (!fileName) return 'fas fa-file text-gray-400';
    if (fileName.endsWith('.pdf')) {
      return 'fas fa-file-pdf text-red-500';
    }
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'fas fa-file-word text-blue-500';
    }
    if (fileName.endsWith('.txt')) {
      return 'fas fa-file-alt text-gray-500';
    }
    return 'fas fa-file text-gray-400';
  };
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

  if (
    loading ||
    isChecking ||
    !serviceRequest ||
    isSubmitting ||
    uploadProgress
  )
    return <Loading progress={uploadProgress} />;

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

  // Check if request is closed
  const isRequestClosed = serviceRequest.status === 'Closed';

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* HERO SUMMARY */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 h-28 md:h-32 shadow-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/Contractor/ServiceRequestManager')}
          className="absolute left-3 top-3 md:left-4 md:top-1/2 md:-translate-y-1/2 inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-white bg-black/20 hover:bg-black/30 rounded-lg transition-colors cursor-pointer backdrop-blur-sm z-10"
        >
          <i className="fas fa-arrow-left mr-2" />
          {t('contractorServiceRequestDetail.backToList')}
        </button>

        <div className="px-4 py-4 md:px-8 md:py-8 text-white h-full flex items-center justify-center">
          <div className="max-w-3xl text-center mt-6 md:mt-0">
            <h1 className="text-xl md:text-3xl font-bold inline-flex items-center gap-2 md:gap-3 justify-center text-center leading-tight">
              <i className="fas fa-clipboard-list opacity-90 hidden sm:inline-block" />
              {t('contractorServiceRequestDetail.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* LEFT: Details + Apply Form/Application Info + Chat */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Specs card */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
            <div className="px-4 py-4 md:px-6 md:py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-screwdriver-wrench mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.serviceType')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {t(`Enums.ServiceType.${serviceRequest.serviceType}`)}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-box-open mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.packageOption')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {t(`Enums.PackageOption.${serviceRequest.packageOption}`)}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-building mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.buildingType')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {t(`Enums.BuildingType.${serviceRequest.buildingType}`)}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-cubes mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.structureType')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {t(
                      `Enums.MainStructure.${serviceRequest.mainStructureType}`
                    )}
                  </p>
                </div>

                {serviceRequest.designStyle && (
                  <div>
                    <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                      <i className="fas fa-palette mr-2 text-gray-400" />
                      {t('contractorServiceRequestDetail.designStyle')}
                    </label>
                    <p className="text-gray-900 font-medium text-sm md:text-base">
                      {t(`Enums.DesignStyle.${serviceRequest.designStyle}`)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fas fa-th-large mr-2 text-gray-400" />
                    {t('contractorServiceRequestDetail.floors')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {serviceRequest.floors}{' '}
                    {t('contractorServiceRequestDetail.floorsUnit')}
                  </p>
                </div>
                <div className="col-span-full">
                  <label className="block text-[10px] md:text-xs uppercase tracking-wide text-gray-500 mb-1">
                    <i className="fa-solid fa-calendar mr-2 text-gray-400" />
                    {t('userPage.serviceRequest.label_timeLine')}
                  </label>
                  <p className="text-gray-900 font-medium text-sm md:text-base">
                    {formatDate(serviceRequest.startDate, i18n.language)}
                    {' - '} {formatDate(serviceRequest.endDate, i18n.language)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions & Estimate row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Dimensions */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-4 py-4 md:px-6 md:py-5">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-ruler-combined text-gray-500" />
                  {t('contractorServiceRequestDetail.dimensions')}
                </h3>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 truncate">
                      {t('contractorServiceRequestDetail.width')}
                    </label>
                    <p className="text-gray-900 text-sm md:text-base">
                      {serviceRequest.width} m
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 truncate">
                      {t('contractorServiceRequestDetail.length')}
                    </label>
                    <p className="text-gray-900 text-sm md:text-base">
                      {serviceRequest.length} m
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 truncate">
                      {t('contractorServiceRequestDetail.totalArea')}
                    </label>
                    <p className="text-base md:text-xl font-bold text-orange-600">
                      {totalArea} m²
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-orange-200">
              <div className="px-4 py-4 md:px-6 md:py-5">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-dollar-sign text-orange-500" />
                  {t('contractorServiceRequestDetail.estimatePrice')}
                </h3>
                {serviceRequest.estimatePrice === 0 ? (
                  <p className="text-orange-600 font-bold text-lg md:text-xl">
                    {t('contractorServiceRequestManager.negotiable')}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-900 font-semibold text-lg md:text-xl mb-1">
                      {formatVND(serviceRequest.estimatePrice)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {numberToWordsByLang(
                        serviceRequest.estimatePrice,
                        i18n.language
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Address & Description row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {serviceRequest.address && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
                <div className="px-4 py-4 md:px-6 md:py-5">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-gray-500" />
                    {t('contractorServiceRequestDetail.address')}
                  </h3>
                  <p
                    className="text-gray-900 text-sm md:text-base break-words"
                    title={addressText}
                  >
                    {addressText}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-4 py-4 md:px-6 md:py-5">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-align-left text-gray-500" />
                  {t('contractorServiceRequestDetail.description')}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base">
                  {serviceRequest.description}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          {serviceRequest.imageUrls && serviceRequest.imageUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
              <div className="px-4 py-4 md:px-6 md:py-5">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-images text-gray-500" />
                  {t('contractorServiceRequestDetail.images')}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
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
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
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
              <div className="px-4 py-4 md:px-6 md:py-5">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                  <i className="fas fa-file-alt text-gray-500" />
                  {t('contractorServiceRequestDetail.documents')}
                </h3>

                <div className="space-y-2 md:space-y-3">
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
                        className="group relative flex items-center gap-3 p-2 md:p-3 rounded-lg border ring-1 ring-gray-200 hover:shadow-md transition"
                      >
                        {/* Icon */}
                        <div className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-md bg-gray-50 border flex-shrink-0">
                          <i
                            className={`fas ${iconClass} text-xl md:text-2xl`}
                          />
                        </div>

                        {/* Name + meta */}
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs md:text-sm font-medium text-gray-800 truncate"
                            title={fileName}
                          >
                            {fileName}
                          </p>
                          <div className="mt-0.5 text-[10px] md:text-xs text-gray-500 flex items-center gap-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 border text-gray-600">
                              {(ext || 'file').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <a
                            href={docUrl}
                            download
                            className="px-2 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition flex-shrink-0"
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

          {/* Apply Form OR Application Details */}
          {isRequestClosed && !existingApplication ? (
            <div className="bg-gray-50 rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 text-center">
              <i className="fas fa-lock text-gray-400 text-3xl md:text-4xl mb-3"></i>
              <p className="text-gray-700 font-semibold mb-1 text-sm md:text-base">
                {t('contractorServiceRequestDetail.closedApplication')}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {t('contractorServiceRequestDetail.requestAlreadyClosed')}
              </p>
            </div>
          ) : !existingApplication && !isRequestClosed ? (
            // Apply Form
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 md:p-6 space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 ring-4 ring-green-100">
                  <i className="fas fa-clipboard-list text-green-600" />
                </span>
                {t('contractorServiceRequestDetail.applyFormTitle')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Bid Price */}
                <div>
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
                    className="w-full pl-4 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={
                      serviceRequest.estimatePrice
                        ? t(
                            'contractorServiceRequestDetail.bidPricePlaceholderWithEst',
                            { est: formatVND(serviceRequest.estimatePrice) }
                          )
                        : t(
                            'contractorServiceRequestDetail.bidPricePlaceholder'
                          )
                    }
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[10, 100, 1000, 10000, 100000].map((factor) => (
                      <button
                        type="button"
                        key={factor}
                        onClick={() =>
                          setEstimatePrice(
                            ((Number(estimatePrice) || 1) * factor).toString()
                          )
                        }
                        className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-xs md:text-sm font-medium"
                      >
                        {((Number(estimatePrice) || 1) * factor)
                          .toString()
                          .replaceAll(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </button>
                    ))}
                  </div>
                  {estimatePrice && (
                    <div className="mt-2 space-y-1 text-xs md:text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <p>
                        {t('contractorServiceRequestDetail.bidPriceLabel')}{' '}
                        <span className="font-semibold text-orange-600">
                          {formatVND(Number(estimatePrice))}
                        </span>
                      </p>
                      <p className="italic">
                        {t('contractorServiceRequestDetail.bidPriceInWords')}{' '}
                        <span className="font-semibold">
                          {numberToWordsByLang(
                            Number(estimatePrice),
                            i18n.language
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-comment-alt mr-2 text-gray-500" />
                    {t('contractorServiceRequestDetail.noteToOwner')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Editor
                    value={description}
                    init={{
                      license_key: 'gpl',
                      height: 300, // Adjusted for mobile
                      menubar: false,
                      plugins: 'lists link image code',
                      toolbar:
                        'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
                      skin: false,
                      content_css: false,
                    }}
                    onEditorChange={(content) => setDescription(content)}
                  />
                </div>
                {descriptionError && (
                  <p className="text-red-500 text-xs md:text-sm font-medium flex items-center mt-2">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {t(descriptionError)}
                  </p>
                )}
                {/* Images Upload */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-images text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_images')}
                    <span className="text-xs text-gray-500 ml-auto">
                      {images.length}/5
                    </span>
                  </label>
                  {images.length < MAX_IMAGES && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center px-4 py-6 md:px-6 md:py-8 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer text-center">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full mb-3">
                          <i className="fas fa-cloud-upload-alt text-orange-500 text-lg md:text-xl"></i>
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-1">
                          <span className="font-semibold text-orange-600">
                            {t('upload.clickToUploadImage')}
                          </span>{' '}
                          {t('upload.orDragAndDrop')}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400">
                          {t('upload.fileTypesHint')}
                        </p>
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
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
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Documents Upload */}
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

                  {documents.length < MAX_DOCUMENTS && (
                    <div className="relative">
                      <input
                        type="file"
                        accept={ACCEPTED_DOC_TYPES}
                        multiple
                        onChange={handleDocumentChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={t('upload.uploadDocuments')}
                      />
                      <div className="flex flex-col items-center justify-center px-4 py-6 md:px-6 md:py-8 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-orange-50 transition-colors cursor-pointer text-center">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full mb-3">
                          <i className="fas fa-cloud-upload-alt text-blue-500 text-lg md:text-xl"></i>
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-1">
                          <span className="font-semibold text-blue-600">
                            {t('upload.clickToUploadDocument')}
                          </span>{' '}
                          {t('upload.orDragAndDrop')}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400">
                          {t('upload.fileTypesHint')}
                        </p>
                      </div>
                    </div>
                  )}

                  {documents.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.url}
                          className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors ring-1 ring-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2 text-center"
                        >
                          <i
                            className={`${getDocumentIcon(
                              doc.name
                            )} text-3xl md:text-4xl mb-2`}
                          ></i>
                          <p className="text-[10px] md:text-xs text-gray-600 break-all truncate px-2 w-full">
                            {doc.name}
                          </p>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                              aria-label="Remove document"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm md:text-base"
                    disabled={
                      !estimatePrice.trim() ||
                      !description.trim() ||
                      !!descriptionError ||
                      isSubmitting
                    }
                  >
                    <i className="fas fa-paper-plane" />
                    {t('contractorServiceRequestDetail.applyForProject')}
                  </button>
                  <p className="mt-3 text-[10px] md:text-xs text-gray-500 text-center">
                    <i className="fas fa-shield-alt mr-1" />
                    {t('contractorServiceRequestDetail.privacyNotice')}
                  </p>
                </div>
              </form>
            </div>
          ) : (
            // Application Details - Show when ALREADY applied
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 ring-4 ring-blue-100">
                    <i className="fas fa-clipboard-check text-blue-600" />
                  </span>
                  {t('contractorServiceRequestDetail.yourApplication')}
                </h3>
                <div className="self-start sm:self-auto">
                  <StatusBadge
                    status={existingApplication.status}
                    type="Application"
                  />
                </div>
              </div>

              {/* Selected Badge for PendingCommission */}
              {existingApplication.status === 'PendingCommission' && (
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-3 md:p-4 ring-2 ring-yellow-400">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-trophy text-yellow-500 text-2xl md:text-3xl"></i>
                    <div>
                      <p className="font-bold text-green-700 text-sm md:text-lg">
                        {t('contractorServiceRequestDetail.youAreSelected')}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {t(
                          'contractorServiceRequestDetail.selectedPendingCommissionNote'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bid Price */}
              <div className="bg-orange-50 rounded-lg p-4 md:p-5 ring-1 ring-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-coins text-orange-500 text-lg md:text-xl"></i>
                  <p className="text-sm font-medium text-gray-700">
                    {t('contractorServiceRequestDetail.yourBid')}
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  {formatVND(existingApplication.estimatePrice)}
                </p>
                <p className="text-xs md:text-sm text-gray-600 break-words">
                  {numberToWordsByLang(
                    existingApplication.estimatePrice,
                    i18n.language
                  )}
                </p>
              </div>

              {/* Description */}
              {existingApplication.description && (
                <div className="border-t pt-4 md:pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-comment-alt text-gray-400"></i>
                    {t('contractorServiceRequestDetail.noteToOwner')}
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4 text-xs md:text-sm overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html: existingApplication.description,
                    }}
                  />
                </div>
              )}

              {/* Images */}
              {existingApplication.imageUrls?.length > 0 && (
                <div className="border-t pt-4 md:pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-images text-gray-400"></i>
                    {t('contractorServiceRequestDetail.images')} (
                    {existingApplication.imageUrls.length})
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                    {existingApplication.imageUrls.map((imageUrl, idx) => (
                      <a
                        key={imageUrl}
                        href={imageUrl}
                        className="venobox aspect-square rounded-lg overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-orange-500 ring-1 ring-gray-200"
                        data-gall="application-gallery"
                      >
                        <img
                          src={imageUrl}
                          alt={`Application ${idx + 1}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Documents */}
              {existingApplication.documentUrls?.length > 0 && (
                <div className="border-t pt-4 md:pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-file-alt text-gray-400"></i>
                    {t('contractorServiceRequestDetail.documents')} (
                    {existingApplication.documentUrls.length})
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    {existingApplication.documentUrls.map((docUrl) => {
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
                          className="group relative flex items-center gap-3 p-2 md:p-3 rounded-lg border ring-1 ring-gray-200 hover:shadow-md transition"
                        >
                          {/* Icon */}
                          <div className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-md bg-gray-50 border flex-shrink-0">
                            <i
                              className={`fas ${iconClass} text-xl md:text-2xl`}
                            />
                          </div>

                          {/* Name + meta */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs md:text-sm font-medium text-gray-800 truncate"
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            <div className="mt-0.5 text-[10px] md:text-xs text-gray-500 flex items-center gap-2">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 border text-gray-600">
                                {(ext || 'file').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <a
                              href={docUrl}
                              download
                              className="px-2 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition flex-shrink-0"
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

              {/* Applied Date */}
              {existingApplication.createdAt && (
                <div className="border-t pt-4">
                  <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                    <i className="fas fa-calendar text-gray-400"></i>
                    {t('contractorServiceRequestDetail.appliedDate')}:{' '}
                    <span className="font-medium">
                      {formatDate(existingApplication.createdAt, i18n.language)}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4 md:pt-6 space-y-3">
                {existingApplication.status === 'PendingCommission' && (
                  <>
                    {/* Commission Calculation Info Box */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 ring-1 ring-blue-200 space-y-3 md:space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-calculator text-blue-600"></i>
                        {t(
                          'contractorServiceRequestDetail.commissionCalculation'
                        )}
                      </h4>

                      {/* 🟢 Hiển thị bảng các mức commission tier */}
                      <div className="bg-white/60 rounded-md p-2 md:p-3 ring-1 ring-blue-100 overflow-x-auto">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          {t(
                            'contractorServiceRequestDetail.publicCommissionTiers'
                          )}
                        </p>
                        <table className="w-full text-xs text-gray-700 min-w-[250px]">
                          <thead>
                            <tr className="border-b border-blue-200 text-left text-[13px] font-semibold">
                              <th className="py-1">
                                {t('contractorServiceRequestDetail.priceRange')}
                              </th>
                              <th className="py-1">
                                {t('contractorServiceRequestDetail.rate')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1 text-gray-500">
                                {t('contractorServiceRequestDetail.tier1')}
                              </td>
                              <td className="py-1 text-blue-600 font-medium">
                                2%
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-500">
                                {t('contractorServiceRequestDetail.tier2')}
                              </td>
                              <td className="py-1 text-blue-600 font-medium">
                                1.5%
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-500">
                                {t('contractorServiceRequestDetail.tier3')}
                              </td>
                              <td className="py-1 text-blue-600 font-medium">
                                1%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 🔵 Phần tính toán riêng cho application hiện tại */}
                      {(() => {
                        const estimatePrice = Number(
                          existingApplication.estimatePrice
                        );
                        let commission = 0;
                        let rate = 0;
                        let tierInfo = '';

                        if (estimatePrice <= 500_000_000) {
                          commission = estimatePrice * 0.02;
                          rate = 2;
                          tierInfo = t('contractorServiceRequestDetail.tier1');
                        } else if (estimatePrice <= 2_000_000_000) {
                          commission = estimatePrice * 0.015;
                          rate = 1.5;
                          tierInfo = t('contractorServiceRequestDetail.tier2');
                        } else {
                          commission = estimatePrice * 0.01;
                          if (commission > 100_000_000)
                            commission = 100_000_000;
                          rate = 1;
                          tierInfo = t('contractorServiceRequestDetail.tier3');
                        }

                        return (
                          <div className="space-y-2">
                            {/* Estimate Price */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                              <span className="text-gray-600">
                                {t('contractorServiceRequestDetail.yourBid')}:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatVND(estimatePrice)}
                              </span>
                            </div>

                            {/* Commission Rate */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                              <span className="text-gray-600">
                                {t(
                                  'contractorServiceRequestDetail.commissionRate'
                                )}
                                :
                              </span>
                              <span className="font-semibold text-blue-600">
                                {rate}% ({tierInfo})
                              </span>
                            </div>

                            <div className="border-t border-blue-200 my-2"></div>

                            {/* Total Commission */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {t(
                                  'contractorServiceRequestDetail.commissionToPay'
                                )}
                                :
                              </span>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-700">
                                  {formatVND(commission)}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-500 break-words">
                                  {numberToWordsByLang(
                                    commission,
                                    i18n.language
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Max cap note */}
                            {estimatePrice > 2_000_000_000 &&
                              commission >= 100_000_000 && (
                                <div className="bg-yellow-50 rounded p-2 ring-1 ring-yellow-200">
                                  <p className="text-xs text-yellow-700 flex items-center gap-1">
                                    <i className="fas fa-info-circle"></i>
                                    {t(
                                      'contractorServiceRequestDetail.maxCommissionNote'
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </div>

                    {existingApplication.dueCommisionTime && (
                      <>
                        <CommissionCountdown
                          dueCommisionTime={
                            existingApplication.dueCommisionTime
                          }
                          onExpired={() => {}}
                        />
                        {new Date(existingApplication.dueCommisionTime) >
                          new Date() && (
                          <button
                            onClick={handlePayCommission}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base"
                          >
                            <i className="fas fa-hand-holding-usd" />
                            {t('contractorServiceRequestDetail.payCommission')}
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}

                {existingApplication.status === 'Pending' && (
                  <>
                    <button
                      onClick={handleDeleteApplication}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base"
                    >
                      <i className="fas fa-trash-alt" />
                      {t('contractorServiceRequestDetail.deleteApplication')}
                    </button>
                    <p className="text-[10px] md:text-xs text-gray-500 text-center">
                      <i className="fas fa-info-circle mr-1" />
                      {t(
                        'contractorServiceRequestDetail.canDeleteWhilePending'
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Customer Contact Info - Show when Approved */}
          {existingApplication?.status === 'Approved' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                <i className="fas fa-user text-gray-500" />
                {t('contractorServiceRequestDetail.customerInfo')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-user-circle text-gray-400 text-lg md:text-xl" />
                  <span className="text-gray-900 font-medium text-sm md:text-base">
                    {serviceRequest.customerName}
                  </span>
                </div>
                <a
                  href={`tel:${serviceRequest.customerPhone}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-100"
                >
                  <i className="fas fa-phone text-blue-600 text-sm md:text-base"></i>
                  <span className="text-sm text-gray-700 font-medium">
                    {serviceRequest.customerPhone}
                  </span>
                </a>
                <a
                  href={`mailto:${serviceRequest.customerEmail}`}
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition border border-purple-100"
                >
                  <i className="fas fa-envelope text-purple-600 text-sm md:text-base"></i>
                  <span className="text-sm text-gray-700 font-medium break-all">
                    {serviceRequest.customerEmail}
                  </span>
                </a>
              </div>
            </div>
          )}
          {/* Review Section - Show when Approved and user is the selected contractor */}
          {existingApplication?.status === 'Approved' &&
            serviceRequest.selectedContractorApplication?.contractorID ===
              user?.id &&
            serviceRequest.review && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                  <i className="fas fa-star text-amber-500" />
                  {t('contractorServiceRequestDetail.customerReview')}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fa-solid fa-star text-lg md:text-2xl ${
                          star <= serviceRequest.review.rating
                            ? 'text-amber-400'
                            : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-amber-600">
                    {serviceRequest.review.rating.toFixed(1)}
                  </span>
                </div>

                {/* Comment */}
                {serviceRequest.review.comment && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t('contractorServiceRequestDetail.reviewComment')}
                    </p>
                    <div
                      className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 md:p-4 text-sm md:text-base"
                      dangerouslySetInnerHTML={{
                        __html: serviceRequest.review.comment,
                      }}
                    />
                  </div>
                )}

                {/* Review Images */}
                {serviceRequest.review.imageUrls?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {t('contractorServiceRequestDetail.reviewImages')}
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                      {serviceRequest.review.imageUrls.map((url, i) => (
                        <a
                          key={`review-${url}-${i}`}
                          href={url}
                          className="venobox aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer block ring-1 ring-gray-200"
                          data-gall="customer-review-gallery"
                        >
                          <img
                            src={url}
                            alt={`review-${i}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Date */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                    <i className="fa-regular fa-calendar"></i>
                    {t('contractorServiceRequestDetail.reviewedAt')}:{' '}
                    <span className="font-medium text-gray-700">
                      {formatDate(
                        serviceRequest.review.createdAt,
                        i18n.language
                      )}
                    </span>
                  </p>
                </div>
              </div>
            )}
          {/* Chat Section */}
          <ChatSection
            conversationID={serviceRequest.conversation?.conversationID}
            applicationStatus={existingApplication?.status}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
          />
        </div>

        {/* RIGHT: Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 md:p-6 lg:sticky lg:top-24 space-y-4 md:space-y-5">
            {/*Create Date */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2 mr-5">
                <i className="fas fa-calendar text-gray-500" />
                {t('contractorServiceRequestDetail.createAt')}
              </h3>
              <p className="text-gray-700 text-sm md:text-base">
                {formatDate(serviceRequest.createdAt, i18n.language)}
              </p>
            </div>
            {/* Status Badge */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2 mr-5">
                <i className="fas fa-info-circle text-gray-500" />
                {t('contractorServiceRequestDetail.projectStatus')}
              </h3>
              <StatusBadge status={serviceRequest.status} type="Request" />
            </div>

            {/* Contractors Info */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                <i className="fas fa-users text-gray-500" />
                {t('contractorServiceRequestDetail.contractorsApplied')}
              </h3>
              <div className="bg-orange-50 rounded-lg p-4 ring-1 ring-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('contractorServiceRequestDetail.totalApplications')}
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {totalApplications}
                  </span>
                </div>
              </div>
            </div>
            {/* Application Status Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                <i className="fas fa-clipboard-check text-gray-500" />
                {t('contractorServiceRequestDetail.applicationStatus')}
              </h3>

              {/* No application from current contractor */}
              {existingApplication ? (
                /* existingApplication exists -> show details */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge
                      status={existingApplication.status}
                      type={'Application'}
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 ring-1 ring-gray-200">
                    <p className="text-xs text-gray-500 mb-1">
                      {t('contractorServiceRequestDetail.yourBid')}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatVND(existingApplication.estimatePrice)}
                    </p>
                  </div>

                  {/* If request closed, show appropriate note */}
                  {isRequestClosed && (
                    <>
                      {/* You were approved */}
                      {existingApplication.status === 'Approved' && (
                        <div className="bg-green-50 rounded-lg p-3 ring-1 ring-green-200">
                          <p className="text-xs text-green-700 flex items-center gap-2">
                            <i className="fas fa-check-circle" />
                            {t(
                              'contractorServiceRequestDetail.requestApprovedNote'
                            )}
                          </p>
                        </div>
                      )}

                      {/* Request closed and awarded to another contractor (not you) */}
                      {serviceRequest.selectedContractorApplication
                        ?.contractorID &&
                        serviceRequest.selectedContractorApplication
                          .contractorID !== user.id && (
                          <div className="bg-yellow-50 rounded-lg p-3 ring-1 ring-yellow-200">
                            <p className="text-xs text-yellow-700 flex items-center gap-2">
                              <i className="fas fa-info-circle" />
                              {t(
                                'contractorServiceRequestDetail.requestClosedNote'
                              )}
                            </p>
                          </div>
                        )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 ring-1 ring-gray-200 text-center">
                  {isRequestClosed ? (
                    <>
                      <i className="fas fa-ban text-gray-400 text-3xl mb-2" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {t('contractorServiceRequestDetail.closedApplication')}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {t(
                          'contractorServiceRequestDetail.requestAlreadyClosed'
                        )}
                      </p>

                      {/* If request closed and selected contractor is someone else -> show note */}
                      {serviceRequest.selectedContractorApplication
                        ?.contractorID &&
                        serviceRequest.selectedContractorApplication
                          .contractorID !== user.id && (
                          <div className="bg-yellow-50 rounded-lg p-3 ring-1 ring-yellow-200 mt-2">
                            <p className="text-xs text-yellow-700 flex items-center gap-2">
                              <i className="fas fa-info-circle" />
                              {t(
                                'contractorServiceRequestDetail.requestClosedNote'
                              )}
                            </p>
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-contract text-gray-400 text-3xl mb-2" />
                      <p className="text-sm text-gray-600">
                        {t('contractorServiceRequestDetail.notAppliedYet')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
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

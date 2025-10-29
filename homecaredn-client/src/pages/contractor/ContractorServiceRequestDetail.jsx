<<<<<<< HEAD
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
=======
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
>>>>>>> develop
import { useTranslation } from 'react-i18next';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import { formatVND, formatDate } from '../../utils/formatters';
import { numberToWordsByLang } from '../../utils/numberToWords';
<<<<<<< HEAD
import { useAuth } from '../../hook/useAuth';
import { uploadImageToCloudinary } from '../../utils/uploadImage';
=======
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
<<<<<<< HEAD
import { paymentService } from '../../services/paymentService';
import PaymentSuccessModal from '../../components/modal/PaymentSuccessModal';
import PaymentCancelModal from '../../components/modal/PaymentCancelModal';
import CommissionCountdown from '../../components/partner/CommissionCountdown';
import useRealtime from '../../hook/useRealtime';

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
//For TINY MCE

=======
<<<<<<< HEAD

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

=======
import { PaymentService } from '../../services/paymentService';
import PaymentSuccessModal from '../../components/modal/PaymentSuccessModal';
import PaymentCancelModal from '../../components/modal/PaymentCancelModal';
>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
export default function ContractorServiceRequestDetail() {
  const { serviceRequestId } = useParams();
  const [searchParams] = useSearchParams();
  const statusShownRef = useRef(false);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { getServiceRequestById, loading } = useServiceRequest();
=======
  const {
    getServiceRequestById,
    loading,
    deleteServiceRequestImage,
    deleteServiceRequestDocument,
  } = useServiceRequest();

>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
  const [serviceRequest, setServiceRequest] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [description, setDescription] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');
<<<<<<< HEAD
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalApplications, setTotalApplication] = useState(0);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Realtime SignalR
  useRealtime(user, 'Contractor', {
    onAcceptedContractorApplication: (payload) => {
      setExistingApplication((prev) => ({
        ...prev,
        status: 'PendingCommission',
        dueCommisionTime: payload?.dueCommisionTime || null,
      }));
    },
    onRejectedContractorApplication: () => {
      setExistingApplication((prev) => ({
        ...prev,
        status: 'Rejected',
      }));
    },
  });
  // Load service request & existing application
=======

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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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
        setTotalApplication(data.contractorApplyCount || 0);
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
    if (serviceRequest) {
      const vb = new VenoBox({ selector: '.venobox' });
      return () => vb.close();
    }
  }, [serviceRequest, existingApplication]);
>>>>>>> develop

<<<<<<< HEAD
  // Chat handlers
  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessage = {
      sender: 'contractor',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Submit contractor application
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error(t('ERROR.REQUIRED_CONTRACTOR_APPLY_DESCRIPTION'));
      return;
    }

    if (!estimatePrice.trim()) {
      toast.error(t('ERROR.REQUIRED_ESTIMATE_PRICE'));
      return;
    }

    const newFiles = images.filter((i) => i.isNew).map((i) => i.file);

    const payload = {
      ServiceRequestID: serviceRequestId,
      ContractorID: user.id,
      Description: description,
      EstimatePrice: Number(estimatePrice),
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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

<<<<<<< HEAD
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

      const appData = await contractorApplicationService.create(payload);
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
      toast.success(t('SUCCESS.APPLICATION_CREATE'));
      setExistingApplication(appData);
      setTotalApplication(totalApplications + 1);
    } catch (error) {
      setUploadProgress(0);
      toast.error(t(handleApiError(error)));
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
          setTotalApplication(totalApplications - 1);
        } catch (err) {
          toast.error(t(handleApiError(err)));
        }
      },
>>>>>>> develop
    });
  }, []);

<<<<<<< HEAD
  // Pay commission
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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
        amount: commission,
        description: serviceRequestId.slice(0, 19),
        itemName: 'Service Request Commission',
      });
>>>>>>> develop

<<<<<<< HEAD
      if (result?.checkoutUrl) globalThis.location.href = result.checkoutUrl;
      else toast.error(t('contractorServiceRequestDetail.paymentFailed'));
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
    } catch (err) {
      toast.error(err?.message || 'Lỗi thanh toán');
    }
  };
>>>>>>> develop

<<<<<<< HEAD
  // Image handlers
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

  if (loading || isChecking || !serviceRequest) return <Loading />;
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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

<<<<<<< HEAD
  // Check if request is closed
  const isRequestClosed = serviceRequest.status === 'Closed';
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* HERO SUMMARY */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 h-12 sm:h-32">
        {/* Back Button */}
        <button
          onClick={() => navigate('/Contractor/service-requests')}
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 text-white bg-black/20 hover:bg-black/30 rounded-lg transition-colors"
        >
          <i className="fas fa-arrow-left mr-2" />
          {t('contractorServiceRequestDetail.backToList')}
        </button>

        <div className="px-6 py-6 sm:px-8 sm:py-8 text-white h-full flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="text-2xl sm:text-3xl font-bold inline-flex items-center gap-3 justify-center">
              <i className="fas fa-clipboard-list opacity-90" />
              {t('contractorServiceRequestDetail.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Details + Apply Form/Application Info + Chat */}
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
<<<<<<< HEAD

                {serviceRequest.designStyle && (
=======
                {designStyle && (
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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
                {serviceRequest.estimatePrice === 0 ? (
                  <p className="text-orange-600 font-bold text-lg">
                    {t('contractorServiceRequestManager.negotiable')}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-900 font-semibold text-xl mb-1">
                      {formatVND(serviceRequest.estimatePrice)}
                    </p>
                    <p className="text-sm text-gray-600">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

<<<<<<< HEAD
          {/* Apply Form OR Application Details */}
          {!existingApplication ? (
            // Apply Form - Show when NOT applied yet and request is not closed
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 space-y-6">
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
              <h3 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 ring-4 ring-green-100">
                  <i className="fas fa-clipboard-list text-green-600" />
                </span>
                {t('contractorServiceRequestDetail.applyFormTitle')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                        className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        {((Number(estimatePrice) || 1) * factor)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </button>
                    ))}
                  </div>
                  {estimatePrice && (
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>
                        {t('contractorServiceRequestDetail.bidPriceLabel')}{' '}
                        <span className="font-semibold text-orange-600">
                          {formatVND(Number(estimatePrice))}
                        </span>
                      </p>
                      <p>
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

                {/* Note (TinyMCE Editor) */}
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
                      height: 500,
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

                {/* Images */}
<<<<<<< HEAD
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-images text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_images')}
                    <span className="text-xs text-gray-500 ml-auto">
                      {images.length}/5
=======
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <i className="fas fa-images text-orange-500 mr-2"></i>
                      {t('userPage.createServiceRequest.form_images')}
                    </label>
                    <span className="text-xs text-gray-500">
                      {images.length}/{MAX_IMAGES}
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
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
                <div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !estimatePrice.trim() ||
                      !description.trim() ||
                      images.length === 0
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
          ) : (
            // Application Details - Show when ALREADY applied
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 ring-4 ring-blue-100">
                    <i className="fas fa-clipboard-check text-blue-600" />
                  </span>
                  {t('contractorServiceRequestDetail.yourApplication')}
                </h3>
                <StatusBadge
                  status={existingApplication.status}
                  type="Application"
                />
              </div>

              {/* Selected Badge for PendingCommission */}
              {existingApplication.status === 'PendingCommission' && (
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-4 ring-2 ring-yellow-400">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-trophy text-yellow-500 text-3xl"></i>
                    <div>
                      <p className="font-bold text-green-700 text-lg">
                        {t('contractorServiceRequestDetail.youAreSelected')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t(
                          'contractorServiceRequestDetail.selectedPendingCommissionNote'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bid Price */}
              <div className="bg-orange-50 rounded-lg p-5 ring-1 ring-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-coins text-orange-500 text-xl"></i>
                  <p className="text-sm font-medium text-gray-700">
                    {t('contractorServiceRequestDetail.yourBid')}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatVND(existingApplication.estimatePrice)}
                </p>
                <p className="text-sm text-gray-600">
                  {numberToWordsByLang(
                    existingApplication.estimatePrice,
                    i18n.language
                  )}
                </p>
              </div>

              {/* Description */}
              {existingApplication.description && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-comment-alt text-gray-400"></i>
                    {t('contractorServiceRequestDetail.noteToOwner')}
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                    dangerouslySetInnerHTML={{
                      __html: existingApplication.description,
                    }}
                  />
                </div>
              )}

              {/* Images */}
              {existingApplication.imageUrls &&
                existingApplication.imageUrls.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <i className="fas fa-images text-gray-400"></i>
                      {t('contractorServiceRequestDetail.images')} (
                      {existingApplication.imageUrls.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

              {/* Applied Date */}
              {existingApplication.createdAt && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <i className="fas fa-calendar text-gray-400"></i>
                    {t('contractorServiceRequestDetail.appliedDate')}:{' '}
                    <span className="font-medium">
                      {formatDate(existingApplication.createdAt, i18n.language)}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-6 space-y-3">
                {existingApplication.status === 'PendingCommission' && (
                  <>
                    {/* Commission Calculation Info Box */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 ring-1 ring-blue-200 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-calculator text-blue-600"></i>
                        {t(
                          'contractorServiceRequestDetail.commissionCalculation'
                        )}
                      </h4>

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
                          tierInfo = t('contractorServiceRequestDetail.tier1'); // "≤ 500 triệu"
                        } else if (estimatePrice <= 2_000_000_000) {
                          commission = estimatePrice * 0.015;
                          rate = 1.5;
                          tierInfo = t('contractorServiceRequestDetail.tier2'); // "500 triệu - 2 tỷ"
                        } else {
                          commission = estimatePrice * 0.01;
                          if (commission > 100_000_000)
                            commission = 100_000_000;
                          rate = 1;
                          tierInfo = t('contractorServiceRequestDetail.tier3'); // "> 2 tỷ"
                        }

                        return (
                          <div className="space-y-2">
                            {/* Estimate Price */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {t('contractorServiceRequestDetail.yourBid')}:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatVND(estimatePrice)}
                              </span>
                            </div>

                            {/* Commission Rate */}
                            <div className="flex items-center justify-between text-sm">
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

                            {/* Divider */}
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
                                <p className="text-xs text-gray-500">
                                  {numberToWordsByLang(
                                    commission,
                                    i18n.language
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Max cap notice for tier 3 */}
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
                    <button
                      onClick={handlePayCommission}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <i className="fas fa-hand-holding-usd" />
                      {t('contractorServiceRequestDetail.payCommission')}
                    </button>

                    {existingApplication.dueCommisionTime && (
                      <CommissionCountdown
                        dueCommisionTime={existingApplication.dueCommisionTime}
                        onExpired={() => {
                          toast.warning(
                            t(
                              'contractorServiceRequestDetail.paymentDeadlineExpired'
                            )
                          );
                        }}
                      />
                    )}
                  </>
                )}

                {existingApplication.status === 'Pending' && (
                  <>
                    <button
                      onClick={handleDeleteApplication}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <i className="fas fa-trash-alt" />
                      {t('contractorServiceRequestDetail.deleteApplication')}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
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
<<<<<<< HEAD

          {/* Customer Contact Info - Show when Approved */}
          {existingApplication?.status === 'Approved' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 inline-flex items-center gap-2">
                <i className="fas fa-user text-gray-500" />
                {t('contractorServiceRequestDetail.customerInfo')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-user-circle text-gray-400 text-xl" />
                  <span className="text-gray-900 font-medium">
                    {serviceRequest.customerName}
                  </span>
                </div>
                <a
                  href={`tel:${serviceRequest.customerPhone}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-100"
                >
                  <i className="fas fa-phone text-blue-600"></i>
                  <span className="text-sm text-gray-700 font-medium">
                    {serviceRequest.customerPhone}
                  </span>
                </a>
                <a
                  href={`mailto:${serviceRequest.customerEmail}`}
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition border border-purple-100"
                >
                  <i className="fas fa-envelope text-purple-600"></i>
                  <span className="text-sm text-gray-700 font-medium">
                    {serviceRequest.customerEmail}
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6 relative">
            <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
              <i className="fas fa-comments"></i>
              <span>{t('contractorServiceRequestDetail.chatSection')}</span>
            </h4>

            {/* Overlay when not approved */}
            {(!existingApplication ||
              existingApplication.status !== 'Approved') && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="text-center text-white px-6">
                  <i className="fas fa-lock text-4xl mb-4"></i>
                  <p className="text-lg font-semibold mb-2">
                    {t('contractorServiceRequestDetail.noChatFunction')}
                  </p>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <i className="fas fa-comment-dots text-4xl mb-2"></i>
                    <p className="text-sm">
                      {t('contractorServiceRequestDetail.no_messages')}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      m.sender === 'contractor'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-[70%] ${
                        m.sender === 'contractor'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder={t(
                  'contractorServiceRequestDetail.input_placeholder'
                )}
              />
              <button
                onClick={handleSend}
                disabled={input.trim() === ''}
                className="px-6 py-2 rounded-lg transition bg-orange-600 text-white hover:bg-orange-700 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {t('BUTTON.Send')}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 lg:sticky lg:top-24 space-y-5">
            {/*Create Date */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2 mr-5">
                <i className="fas fa-calendar text-gray-500" />
                {t('contractorServiceRequestDetail.createAt')}
              </h3>
              {formatDate(serviceRequest.createdAt, i18n.language)}
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
              {!existingApplication ? (
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
              ) : (
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
              )}
            </div>
          </div>
=======
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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

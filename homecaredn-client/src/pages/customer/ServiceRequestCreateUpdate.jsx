import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEnums } from '../../hook/useEnums';
import { useAuth } from '../../hook/useAuth';
import { useAddress } from '../../hook/useAddress';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { handleApiError } from '../../utils/handleApiError';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { numberToWordsByLang } from '../../utils/numberToWords';
import { formatVND } from '../../utils/formatters';
import Swal from 'sweetalert2';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import Loading from '../../components/Loading';

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

export default function ServiceRequestCreateUpdate() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addressLoading, addresses } = useAddress();
  const { serviceRequestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedService = location.state?.service;
  const {
    createServiceRequest,
    updateServiceRequest,
    getServiceRequestById,
    deleteServiceRequestImage,
    deleteServiceRequestDocument,
  } = useServiceRequest();
  const enums = useEnums();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageProgress, setImageProgress] = useState({ loaded: 0, total: 0 });
  const [documentProgress, setDocumentProgress] = useState({
    loaded: 0,
    total: 0,
  });

  // Form state
  const [addressID, setAddressID] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [packageOption, setPackageOption] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [mainStructureType, setMainStructureType] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [floors, setFloors] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  // upload docs and imgs progress
  useEffect(() => {
    const totalLoaded = imageProgress.loaded + documentProgress.loaded;
    const totalSize = imageProgress.total + documentProgress.total;

    const percent = Math.min(100, Math.round((totalLoaded * 100) / totalSize));
    setUploadProgress(percent);
  }, [imageProgress, documentProgress, uploadProgress]);

  // Load data khi edit
  useEffect(() => {
    if (serviceRequestId) {
      getServiceRequestById(serviceRequestId)
        .then((res) => {
          setAddressID(res.addressID || '');
          setServiceType(res.serviceType || '');
          setPackageOption(res.packageOption || '');
          setBuildingType(res.buildingType || '');
          setMainStructureType(res.mainStructureType || '');
          setDesignStyle(res.designStyle || '');
          setWidth(res.width || '');
          setLength(res.length || '');
          setFloors(res.floors || '');
          setEstimatePrice(res.estimatePrice || '');
          setDescription(res.description || '');
          setImages(
            (res.imageUrls || []).map((url) => ({ url, isNew: false }))
          );
          setDocuments(
            (res.documentUrls || []).map((url) => ({
              url,
              isNew: false,
              name: getFileNameFromUrl(url),
            }))
          );
        })
        .catch((err) => handleApiError(err, t));
    } else if (passedService) {
      // Nếu là tạo mới và có dữ liệu service truyền qua
      setServiceType(passedService.serviceType || '');
      setPackageOption(passedService.packageOption || '');
      setBuildingType(passedService.buildingType || '');
      setMainStructureType(passedService.mainStructureType || '');
      setDesignStyle(passedService.designStyle || '');
    }
  }, [serviceRequestId, passedService, getServiceRequestById, t]);

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
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + documents.length > 5) {
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
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return 'unknown_file';

    const urlWithoutQuery = url.split('?')[0];
    const segments = urlWithoutQuery.split('/');
    const fileName = segments.pop();

    return decodeURIComponent(fileName);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (images.some((i) => i.isNew) || documents.some((d) => d.isNew)) {
      setUploadProgress(1);
    }
    try {
      if (!addressID) {
        toast.error(t('ERROR.REQUIRED_ADDRESS'));
        return;
      }
      if (!serviceType) {
        toast.error(t('ERROR.REQUIRED_SERVICE_TYPE'));
        return;
      }
      if (!packageOption) {
        toast.error(t('ERROR.REQUIRED_PACKAGE_OPTION'));
        return;
      }
      if (!buildingType) {
        toast.error(t('ERROR.REQUIRED_BUILDING_TYPE'));
        return;
      }
      if (!mainStructureType) {
        toast.error(t('ERROR.REQUIRED_STRUCTURE_TYPE'));
        return;
      }
      if (!description) {
        toast.error(t('ERROR.REQUIRED_SERVICE_REQUEST_DESCRIPTION'));
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

      const newImageFiles = images.filter((i) => i.isNew).map((i) => i.file);
      const newDocumentFiles = documents
        .filter((d) => d.isNew)
        .map((d) => d.file);

      const payload = {
        CustomerID: user.id,
        AddressID: addressID,
        ServiceType: serviceType,
        PackageOption: packageOption,
        BuildingType: buildingType,
        MainStructureType: mainStructureType,
        DesignStyle: designStyle,
        Width: width,
        Length: length,
        Floors: floors,
        EstimatePrice: estimatePrice ? Number(estimatePrice) : null,
        Description: description,
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
                'HomeCareDN/ServiceRequest'
              )
            : Promise.resolve(null);

        const documentUploadPromise =
          newDocumentFiles.length > 0
            ? uploadToCloudinary(
                newDocumentFiles,
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                (progress) => setDocumentProgress(progress),
                'HomeCareDN/ServiceRequest/Documents',
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

        if (serviceRequestId) {
          payload.ServiceRequestID = serviceRequestId;
          await updateServiceRequest(payload);
        } else {
          await createServiceRequest(payload);
        }

        navigate('/Customer', {
          state: { tab: 'service_requests' },
        });
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setUploadProgress(0);
        setImageProgress({ loaded: 0, total: 0 });
        setDocumentProgress({ loaded: 0, total: 0 });
      }
    } catch {
      /// Handle in context
    } finally {
      setUploadProgress(0);
      setIsSubmitting(false);
    }
  };

  // Xoá ảnh khỏi state
  const removeImageFromState = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };

  // Xử lý xoá ảnh (phân biệt ảnh mới / ảnh cũ)
  const handleRemoveImage = (img) => {
    if (img.isNew) {
      // Ảnh mới chỉ xoá trong state
      removeImageFromState(img);
    } else {
      // Ảnh cũ: confirm + gọi API xoá
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

  const removeDocumentFromState = (doc) => {
    setDocuments((prev) => prev.filter((d) => d.url !== doc.url));
  };

  const handleRemoveDocument = (doc) => {
    if (doc.isNew) {
      removeDocumentFromState(doc);
    } else {
      showDeleteModal({
        t,
        titleKey: t('ModalPopup.DeleteDocumentModal.title'),
        textKey: t('ModalPopup.DeleteDocumentModal.text'),
        onConfirm: async () => {
          try {
            await deleteServiceRequestDocument(serviceRequestId, doc.url);
            Swal.close();
            toast.success(t('SUCCESS.DELETE'));
            removeDocumentFromState(doc);
          } catch (err) {
            handleApiError(err, t);
          }
        },
      });
    }
  };
  if (uploadProgress || isSubmitting || addressLoading)
    return <Loading progress={uploadProgress} />;

  return (
    <>
      {/* FontAwesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() =>
                navigate('/Customer', {
                  state: { tab: 'service_requests' },
                })
              }
              className="inline-flex items-center px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
            >
              <i className="fas fa-arrow-left mr-2"></i> {t('BUTTON.Back')}
            </button>
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <i className="fas fa-clipboard-list text-2xl text-orange-600"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('userPage.createServiceRequest.title')}
              </h1>
              <p className="text-gray-600">
                {t('userPage.createServiceRequest.subtitle')}
              </p>
            </div>
            <div className="w-[118px]"></div>
          </div>

          {/* Form */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <i className="fas fa-edit mr-2"></i>
                {t('userPage.createServiceRequest.header')}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-cogs text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_serviceType')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option value="">
                        {t(
                          'userPage.createServiceRequest.form_selectServiceType'
                        )}
                      </option>
                      {enums?.serviceTypes?.map((s) => (
                        <option key={s.value} value={s.value}>
                          {t(`Enums.ServiceType.${s.value}`)}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Package Option */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-box text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_packageOption')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={packageOption}
                      onChange={(e) => setPackageOption(e.target.value)}
                    >
                      <option value="">
                        {t(
                          'userPage.createServiceRequest.form_selectPackageOption'
                        )}
                      </option>
                      {enums?.packageOptions?.map((p) => (
                        <option key={p.value} value={p.value}>
                          {t(`Enums.PackageOption.${p.value}`)}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Building Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-building text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_buildingType')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
                    >
                      <option value="">
                        {t(
                          'userPage.createServiceRequest.form_selectBuildingType'
                        )}
                      </option>
                      {enums?.buildingTypes?.map((b) => (
                        <option key={b.value} value={b.value}>
                          {t(`Enums.BuildingType.${b.value}`)}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Main Structure Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-hammer text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_structureType')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={mainStructureType}
                      onChange={(e) => setMainStructureType(e.target.value)}
                    >
                      <option value="">
                        {t(
                          'userPage.createServiceRequest.form_selectStructureType'
                        )}
                      </option>
                      {enums?.mainStructures?.map((s) => (
                        <option key={s.value} value={s.value}>
                          {t(`Enums.MainStructure.${s.value}`)}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Design Style */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-paint-brush text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_designStyle')}
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={designStyle}
                      onChange={(e) => setDesignStyle(e.target.value)}
                    >
                      <option value="">
                        {t(
                          'userPage.createServiceRequest.form_selectDesignStyle'
                        )}
                      </option>
                      {enums?.designStyles?.map((s) => (
                        <option key={s.value} value={s.value}>
                          {t(`Enums.DesignStyle.${s.value}`)}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Width */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-arrows-alt-h text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_width')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={t(
                      'userPage.createServiceRequest.form_widthPlaceholder'
                    )}
                  />
                </div>

                {/* Length */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-arrows-alt-v text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_length')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={t(
                      'userPage.createServiceRequest.form_lengthPlaceholder'
                    )}
                  />
                </div>

                {/* Floors */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-layer-group text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_floor')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={t(
                      'userPage.createServiceRequest.form_floorPlaceholder'
                    )}
                  />
                </div>
                {width && length && floors ? (
                  <p className="text-sm text-gray-600 mt-1 mb-2">
                    {t('userPage.createServiceRequest.calculatedArea')}:{' '}
                    <span className="font-semibold text-orange-600">
                      {(
                        Number(width) *
                        Number(length) *
                        Number(floors)
                      ).toFixed(1)}{' '}
                      m²
                    </span>
                  </p>
                ) : (
                  <p></p>
                )}

                {/* Estimate Price */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-dollar-sign text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_estimatePrice')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={estimatePrice}
                    onChange={(e) => setEstimatePrice(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder={t(
                      'userPage.createServiceRequest.form_estimatePricePlaceholder'
                    )}
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
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-orange-50 hover:border-orange-300 text-sm font-medium text-gray-700 transition-colors"
                      >
                        {((Number(estimatePrice) || 1) * factor)
                          .toString()
                          .replaceAll(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </button>
                    ))}
                  </div>
                  {estimatePrice && (
                    <>
                      <p className="text-sm text-gray-500">
                        {t('userPage.createServiceRequest.estimatePrice')}
                        <span className="font-semibold text-orange-600">
                          {formatVND(Number(estimatePrice))}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('userPage.createServiceRequest.estimateInWord')}
                        <span className="font-semibold">
                          {numberToWordsByLang(
                            Number(estimatePrice),
                            i18n.language
                          )}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-map-marker-alt text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_address')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={addressID}
                      onChange={(e) => setAddressID(e.target.value)}
                    >
                      <option value="">
                        {t('userPage.createServiceRequest.form_selectAddress')}
                      </option>
                      {addresses?.map((a) => (
                        <option key={a.addressID} value={a.addressID}>
                          {a.detail},{a.ward},{a.district},{a.city}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-comment-alt text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_description')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder={t(
                      'userPage.createServiceRequest.form_descriptionPlaceholder'
                    )}
                  />
                </div>

                {/* Images Upload Section */}
                <div className="space-y-4 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-images text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_images')}
                  </label>

                  {images.length < MAX_IMAGES && (
                    <>
                      {/* Upload Button */}
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
                              {t('upload.clickToUploadImage')}
                            </span>{' '}
                            {t('upload.orDragAndDrop')}
                          </p>
                          <p className="text-sm text-gray-400">
                            {t('upload.fileTypesHint')}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={img.url}
                          className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
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
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            >
                              <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                          </div>
                          {img.isNew && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('common.new')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents Upload Section */}
                <div className="space-y-4 lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-file-alt text-orange-500 mr-2"></i>
                    {t('userPage.createServiceRequest.form_documents')}
                  </label>

                  {documents.length < MAX_DOCUMENTS && (
                    <>
                      {/* Document Upload Button */}
                      <div className="relative">
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES} // Specify accepted types
                          multiple
                          onChange={handleDocumentChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-orange-50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                            <i className="fas fa-file-upload  text-blue-500 text-xl"></i>
                          </div>
                          <p className="text-gray-600 text-center mb-2">
                            <span className="font-semibold text-blue-600">
                              {t('upload.clickToUploadDocument')}
                            </span>{' '}
                            {t('upload.orDragAndDrop')}
                          </p>
                          <p className="text-sm text-gray-400">
                            PDF, DOC, DOCX, TXT {/* Hint for file types */}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Document Preview Grid */}
                  {documents.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.url}
                          className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors bg-gray-50 flex flex-col items-center justify-center p-2"
                        >
                          <i
                            className={`${getDocumentIcon(
                              doc.name
                            )} text-4xl mb-2`}
                          ></i>
                          <p className="text-xs text-gray-600 text-center break-all truncate px-2">
                            {doc.name}
                          </p>
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            >
                              <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                          </div>
                          {doc.isNew && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('common.new')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-4 focus:ring-orange-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  {serviceRequestId
                    ? t('BUTTON.UpdateServiceRequest')
                    : t('BUTTON.CreateServiceRequest')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

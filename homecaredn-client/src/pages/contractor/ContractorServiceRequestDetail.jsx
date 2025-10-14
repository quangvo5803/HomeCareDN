import { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { useTranslation } from "react-i18next"; 
import { useServiceRequest } from '../../hook/useServiceRequest'; 
import { contractorApplicationService } from '../../services/contractorApplicationService'; 
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

export default function ContractorServiceRequestDetail() { 
  const { serviceRequestId } = useParams(); 
  const { t, i18n } = useTranslation(); 
  const { user } = useAuth(); 
  const navigate = useNavigate(); 
  const { getServiceRequestById, loading, deleteServiceRequestImage } = useServiceRequest(); 
  const [serviceRequest, setServiceRequest] = useState(null); 
  const [existingApplication, setExistingApplication] = useState(null); 
  const [isChecking, setIsChecking] = useState(false); 
  const [images, setImages] = useState([]); 
  const [description, setDescription] = useState(''); 
  const [estimatePrice, setEstimatePrice] = useState(''); 
  const [uploadProgress, setUploadProgress] = useState(0); 

  useEffect(() => { 
    const loadData = async () => { 
      if (!serviceRequestId || !user?.id) return; 

      try { 
        setIsChecking(true); 
        
        const serviceRequestData = await getServiceRequestById(serviceRequestId); 

        setServiceRequest(serviceRequestData); 

        const existingApplicationData = await contractorApplicationService.getApplication({
          ServiceRequestID: serviceRequestId,
          ContractorID: user.id,
        });

        setExistingApplication(existingApplicationData); 

      } catch (error) { 
        toast.error(t(handleApiError(error)));
      } finally { 
        setIsChecking(false); 
      } 
    }; 

    loadData(); 
  }, [serviceRequestId, getServiceRequestById, user, t]); 
  useEffect(() => {
    if (!serviceRequest) return;
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  }, [serviceRequest, existingApplication]);

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
      EstimatePrice: estimatePrice 
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
      
      await contractorApplicationService.createContractorApplication(payload); 
      toast.success(t('SUCCESS.APPICATION_CREATE')); 
      
      const appData = await contractorApplicationService.getApplication({
        serviceRequestId: serviceRequestId,
        contractorId: user.id
      });
      setExistingApplication(appData); 

    } catch(error){ 
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
          await contractorApplicationService.deleteApplication(existingApplication.contractorApplicationID); 
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
  if (!serviceRequest) return <div>{t('contractorServiceRequestDetail.serviceRequestNotFound')}</div>; 
  if (uploadProgress > 0) return <Loading message={`${t('createServiceRequest.uploading')} ${uploadProgress}%`} />; 


  return ( 
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"> 
      <div className="mb-3"> 
        <button 
          onClick={() => navigate('/Contractor/service-requests')} 
          className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" 
        > 
          <i className="fas fa-arrow-left mr-2" /> 
          {t('contractorServiceRequestDetail.backToList')} 
        </button> 
      </div> 

      <div className="mb-6"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center"> 
          <span className="inline-flex items-center justify-center gap-3"> 
            <i className="fas fa-clipboard-list text-orange-600" /> 
            {t('contractorServiceRequestDetail.title')} 
          </span> 
        </h1> 
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8"> 
        {/* LEFT: Details*/} 
        <div className="lg:col-span-8"> 
          <div className="bg-white rounded-lg shadow-lg overflow-hidden"> 
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
              {serviceRequest.imageUrls && serviceRequest.imageUrls.length > 0 && ( 
                <div className="mt-6"> 
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2"> 
                    <i className="fas fa-images" /> 
                    {t('contractorServiceRequestDetail.images')} 
                  </h3> 
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {serviceRequest.imageUrls.map((imageUrl) => (
                      <a
                        key={imageUrl}
                        href={imageUrl}
                        className="venobox aspect-square rounded-lg overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-orange-500"
                        data-gall="service-request-gallery"
                        aria-label={`${t('contractorServiceRequestDetail.viewFullSize')} - ${t('contractorServiceRequestDetail.serviceRequestImage')}`}
                      >
                        <img
                          src={imageUrl}
                          alt={t('contractorServiceRequestDetail.serviceRequestImage')}
                          className="w-full h-full object-contain bg-white p-1 group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div> 
              )} 
              <div className="mt-6"> 
                <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2"> 
                  <i className="fas fa-info-circle" /> 
                  {t('contractorServiceRequestDetail.applicationStatus')} 
                </h3> 
                <div className={`rounded-lg p-4 ring-1 ${serviceRequest.isOpen ? 'bg-green-50 ring-green-200' : 'bg-gray-50 ring-gray-200'}`}> 
                  <div className="flex items-center space-x-2"> 
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${serviceRequest.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} /> 
                    <span className="text-gray-800 font-medium"> 
                      {serviceRequest.isOpen ? t('contractorServiceRequestDetail.statusOpen') : t('contractorServiceRequestDetail.statusClosed')} 
                    </span> 
                  </div> 
                </div> 
              </div> 
            </div> 
          </div> 
        </div> 

          {/* RIGHT: Apply Form or Applied Details */} 
          <div className="lg:col-span-4"> 
            {existingApplication ? ( 
              // UI Applied 
              <div className="bg-white rounded-lg shadow-lg ring-1 ring-blue-200 p-6 lg:sticky lg:top-24"> 
                <h3 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2 text-blue-600"> 
                  <i className="fas fa-check-circle" /> 
                  {t('contractorServiceRequestDetail.appliedTitle')} 
                </h3> 
                <div className="space-y-4"> 
                  <div> 
                    <label className="block text-sm font-medium text-gray-500"><i className="fas fa-coins mr-2" />{t('contractorServiceRequestDetail.yourBid')}</label> 
                    <p className="text-lg font-bold text-gray-800">{formatVND(existingApplication.estimatePrice)}</p> 
                  </div> 
                  <div> 
                    <label className="block text-sm font-medium text-gray-500"><i className="fas fa-comment-alt mr-2" />{t('contractorServiceRequestDetail.yourNote')}</label> 
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{existingApplication.description}</p> 
                  </div> 
                  {existingApplication.imageUrls && existingApplication.imageUrls.length > 0 && ( 
                    <div> 
                      <label className="block text-sm font-medium text-gray-500 mb-2"><i className="fas fa-images mr-2" />{t('contractorServiceRequestDetail.yourImages')}</label> 
                    <div className="grid grid-cols-3 gap-2">
                          {existingApplication.imageUrls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              className="venobox aspect-square rounded-md overflow-hidden block group focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white p-1"
                              data-gall="application-gallery"
                              aria-label={t('contractorServiceRequestDetail.appliedImage')}
                            >
                              <img
                                src={url}
                                alt={t('contractorServiceRequestDetail.appliedImage')}
                                className="w-full h-full object-contain bg-white p-1 group-hover:scale-105 transition-transform"
                              />
                            </a>
                          ))}
                      </div>
                    </div> 
                  )} 
                  <div className="pt-4 border-t border-gray-200"> 
                    <button onClick={handleDeleteApplication} className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"> 
                      <i className="fas fa-trash-alt" /> 
                      {t('contractorServiceRequestDetail.deleteApplication')} 
                    </button> 
                  </div> 
                </div> 
              </div> 
            ) : ( 
              // UI Not Apply 
              <div className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-6 lg:sticky lg:top-24"> 
                <h3 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center gap-2"> 
                  <i className="fas fa-clipboard-list" /> 
                  {t('contractorServiceRequestDetail.applyFormTitle')} 
                </h3> 
                <form onSubmit={handleSubmit} className="space-y-4"> 
                  <div> 
                    <label className="block text-sm font-medium text-gray-700 mb-1"> 
                      <i className="fas fa-coins mr-2" /> 
                      {t('contractorServiceRequestDetail.bidPrice')} 
                    </label> 
                    <input 
                      type="number" 
                      min="0" 
                      value={estimatePrice} 
                      onChange={(e) => setEstimatePrice(e.target.value)} 
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
                  <div> 
                    <label className="block text-sm font-medium text-gray-700 mb-1"> 
                      <i className="fas fa-comment-alt mr-2" /> 
                      {t('contractorServiceRequestDetail.noteToOwner')} 
                    </label> 
                    <textarea 
                      rows={4} 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder={t('contractorServiceRequestDetail.notePlaceholder')} 
                      aria-label={t('contractorServiceRequestDetail.noteToOwner')} 
                      className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    /> 
                  </div> 
                  
                  <div className="space-y-4 lg:col-span-2"> 
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2"> 
                      <i className="fas fa-images text-orange-500 mr-2"></i> 
                      {t('userPage.createServiceRequest.form_images')} 
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
                            {i18n.language === 'vi' 
                              ? 'Bấm để tải lên' 
                              : 'Click to upload'} 
                          </span>{' '} 
                          {i18n.language === 'vi' 
                            ? 'hoặc kéo và thả' 
                            : 'or drag and drop'} 
                        </p> 
                        <p className="text-sm text-gray-400"> 
                          {i18n.language === 'vi' 
                            ? 'PNG, JPG, GIF tối đa 5MB mỗi file' 
                            : 'PNG, JPG, GIF up to 5MB each'} 
                        </p> 
                      </div> 
                    </div> 

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
                              className="w-full h-full object-contain bg-white p-1" 
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
                                  {i18n.language === 'vi' ? 'Mới' : 'New'} 
                                </span> 
                              </div> 
                            )} 
                          </div> 
                        ))} 
                      </div> 
                    )} 
                  </div> 
                  <div className="pt-2"> 
                    <button 
                      type="submit" 
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                      disabled={!estimatePrice.trim() || !description.trim()} 
                    > 
                      <i className="fas fa-paper-plane" /> 
                      {t('contractorServiceRequestDetail.applyForProject')} 
                    </button> 
                  </div> 
                </form> 
              </div> 
            )} 
          </div> 
      </div> 
    </div> 
  ); 
}


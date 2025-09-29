import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import partnerService from '../services/partnerService';
import { isSafeEmail } from '../utils/validateEmail';

const PartnerRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const partnerTypeFromUrl = searchParams.get('type');
  
  const [formData, setFormData] = useState({
    partnerType: partnerTypeFromUrl || '',
    fullName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    description: '',
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePublicIds, setImagePublicIds] = useState([]);

  useEffect(() => {
    if (!partnerTypeFromUrl || !['Distributor', 'Contractor'].includes(partnerTypeFromUrl)) {
      navigate('/PartnerTypeSelection');
    }
  }, [partnerTypeFromUrl, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleImageUpload = useCallback(async (files) => {
    if (!files?.length) return;
    if (files.length + imageUrls.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE') || 'Maximum 5 images allowed');
      return;
    }
    try {
      setUploading(true);
      const uploaded = await uploadImageToCloudinary(
        files,
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        null,
        'HomeCareDN/Partner'
      );
      const arr = Array.isArray(uploaded) ? uploaded : [uploaded];
      setImageUrls(prev => [...prev, ...arr.map(x => x.url)]);
      setImagePublicIds(prev => [...prev, ...arr.map(x => x.publicId)]);
      toast.success(t('SUCCESS.UPLOAD', 'Uploaded successfully'));
    } catch {
      toast.error(t('ERROR.UPLOAD_FAILED', 'Failed to upload image(s)'));
    } finally {
      setUploading(false);
    }
  }, [imageUrls.length, t]);

  const removeImage = useCallback((index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImagePublicIds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileInputChange = useCallback((e) => {
    handleImageUpload(Array.from(e.target.files || []));
  }, [handleImageUpload]);

  // Accessible click handler for upload area  
  const handleUploadAreaClick = useCallback(() => {
    document.getElementById('image-upload')?.click();
  }, []);

  // Keyboard handler for upload area
  const handleUploadAreaKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUploadAreaClick();
    }
  }, [handleUploadAreaClick]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || formData.fullName.length > 255) {
        toast.error(t('partner.validation.full_name_required'));
        return;
      }
      if (!formData.companyName || formData.companyName.length > 255) {
        toast.error(t('partner.validation.company_name_required'));  
        return;
      }
      if (!formData.email || !isSafeEmail(formData.email)) {
        toast.error(t('partner.validation.email_required'));
        return;
      }
      if (!formData.phoneNumber || formData.phoneNumber.length > 30) {
        toast.error(t('partner.validation.phone_required'));
        return;
      }
      if (formData.description && formData.description.length > 1000) {
        toast.error('Description too long (max 1000 characters)');
        return;
      }
      if (imageUrls.length === 0) {
        toast.error(t('partner.validation.images_required'));
        return;
      }

      const requestData = {
        partnerType: formData.partnerType,
        fullName: formData.fullName,
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        description: formData.description || null,
        imageUrls: imageUrls,
        imagePublicIds: imagePublicIds,
      };

      await partnerService.createPartner(requestData);
      toast.success(t('partner.registration_success'));
      
      setTimeout(() => {
        navigate('/Login');
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || t('partner.registration_error'));
    } finally {
      setLoading(false);
    }
  }, [formData, imageUrls, imagePublicIds, t, navigate]);

  const handleNavigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleNavigatePartnerType = useCallback(() => {
    navigate('/PartnerTypeSelection');  
  }, [navigate]);

  const handleNavigateBack = useCallback(() => {
    navigate('/PartnerTypeSelection');
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Main Container - Single card, no header/footer */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full relative z-10">
        {/* Header với logo và partner type */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="transition-transform duration-300 transform hover:scale-105"
              aria-label={t('common.home', 'Go to home')}
            >
              <img 
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN"
                className="h-8 filter brightness-0 invert"
              />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-1">
                {t('partner.partner_registration')}
              </h1>
              <div className="flex items-center justify-center text-blue-100">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  formData.partnerType === 'Distributor' ? 'bg-blue-400' : 'bg-green-400'
                }`}></div>
                <span className="text-sm">
                  {t(`partner.${formData.partnerType.toLowerCase()}`)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNavigatePartnerType}
              className="text-blue-100 hover:text-white transition-colors p-1"
              title={t('partner.change_type')}
              aria-label={t('partner.change_type', 'Change partner type')}
            >
              <i className="fas fa-edit"></i>
            </button>
          </div>
        </div>

        {/* Form Container với max height và scroll */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                maxLength="255"
                className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                placeholder="Full Name"
              />
              <label
                htmlFor="fullName"
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.fullName
                    ? '-top-2 text-xs bg-white px-1 text-blue-600'
                    : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                }`}
              >
                {t('partner.full_name', 'Full name')} *
              </label>
            </div>

            {/* Company Name */}
            <div className="relative">
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                maxLength="255"
                className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                placeholder="Company Name"
              />
              <label
                htmlFor="companyName"
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.companyName
                    ? '-top-2 text-xs bg-white px-1 text-blue-600'
                    : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                }`}
              >
                {t('partner.company_name')} *
              </label>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  maxLength="255"
                  className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                  placeholder="Email"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.email
                      ? '-top-2 text-xs bg-white px-1 text-blue-600'
                      : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                  }`}
                >
                  {t('partner.email')} *
                </label>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  maxLength="30"
                  className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                  placeholder="Phone"
                />
                <label
                  htmlFor="phoneNumber"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.phoneNumber
                      ? '-top-2 text-xs bg-white px-1 text-blue-600'
                      : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                  }`}
                >
                  {t('partner.phone_number')} *
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="relative">
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                maxLength="1000"
                className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer resize-none"
                placeholder="Description"
              />
              <label
                htmlFor="description"
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.description
                    ? '-top-2 text-xs bg-white px-1 text-blue-600'
                    : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                }`}
              >
                {t('partner.description')}
              </label>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.description.length}/1000
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                {t('partner.business_images')} *
              </label>
              
              {/* Accessible upload area */}
              <button
                type="button"
                className="w-full border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/30 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleUploadAreaClick}
                onKeyDown={handleUploadAreaKeyDown}
                aria-describedby="upload-help"
                disabled={uploading}
              >
                <i className="fas fa-cloud-upload-alt text-2xl text-blue-400 mb-2" aria-hidden="true"></i>
                <p className="text-blue-600 text-sm font-medium mb-1">
                  {t('partner.drag_drop_images')}
                </p>
                <p id="upload-help" className="text-xs text-gray-500">
                  {t('partner.image_requirements')}
                </p>
              </button>

              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-label={t('partner.business_images', 'Business images')}
              />

              {/* Image Preview */}
              {imageUrls.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {t('partner.uploaded_images', 'Uploaded images')} ({imageUrls.length}/5)
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={`upload-${Date.now()}-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={t('partner.preview_image', 'Preview image {{number}}', { number: index + 1 })}
                          className="w-full h-16 object-cover rounded border"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          aria-label={t('partner.remove_image', 'Remove image {{number}}', { number: index + 1 })}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleNavigateBack}
                className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                {t('common.back')}
              </button>
              
              <button
                type="submit"
                disabled={loading || uploading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 ${
                  loading || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {loading || uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="sr-only">{t('common.loading', 'Loading')}</span>
                    {t('partner.submitting')}
                  </span>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2" aria-hidden="true"></i>
                    {t('partner.submit_application')}
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg" role="note">
              <p className="text-xs text-blue-800 flex items-start">
                <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-600 text-sm flex-shrink-0" aria-hidden="true"></i>
                {t('partner.review_process_info')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;

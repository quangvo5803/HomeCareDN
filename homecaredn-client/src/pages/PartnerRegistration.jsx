import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import partnerService from '../services/partnerService';
import { isSafeEmail } from '../utils/validateEmail';
import PropTypes from 'prop-types';


const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['Distributor', 'Contractor'];


export default function PartnerRegistration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);


  const fileInputRef = useRef(null);


  const isValidType = useMemo(
    () => ALLOWED_TYPES.includes(partnerTypeFromUrl || ''),
    [partnerTypeFromUrl]
  );
  const safeType = useMemo(
    () => (ALLOWED_TYPES.includes(formData.partnerType) ? formData.partnerType : ''),
    [formData.partnerType]
  );
  const canSubmit = useMemo(() => !loading && !uploading, [loading, uploading]);


  useEffect(() => {
    if (!isValidType) navigate('/PartnerTypeSelection', { replace: true });
  }, [isValidType, navigate]);


  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);


  const validateForm = useCallback(
    (data, imagesCount) => {
      if (!data.fullName.trim()) {
        toast.error(t('partner.validation.full_name_required'));
        return false;
      }
      if (!data.companyName.trim()) {
        toast.error(t('partner.validation.company_name_required'));
        return false;
      }
      if (!data.email.trim()) {
        toast.error(t('partner.validation.email_required'));
        return false;
      }
      if(  !isSafeEmail(data.email)){
        toast.error(t('partner.validation.email_invalid'));
        return false;
      }
      if (!data.phoneNumber.trim()) {
        toast.error(t('partner.validation.phone_required'));
        return false;
      }
      if (data.description.length > 1000) {
        toast.error(t('partner.validation.description_too_long'));
        return false;
      }
      if (imagesCount === 0) {
        toast.error(t('partner.validation.images_required'));
        return false;
      }
      return true;
    },
    [t]
  );


  const handleImageUpload = useCallback(
    async (files) => {
      if (!files?.length) return;
      if (files.length + imageUrls.length > MAX_IMAGES) {
        toast.error(t('ERROR.MAXIMUM_IMAGE') || `Maximum ${MAX_IMAGES} images allowed`);
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
        setImageUrls((prev) => [...prev, ...arr.map((x) => x.url)]);
        setImagePublicIds((prev) => [...prev, ...arr.map((x) => x.publicId)]);
        toast.success(t('SUCCESS.UPLOAD', 'Uploaded successfully'));
      } catch {
        toast.error(t('ERROR.UPLOAD_FAILED', 'Failed to upload image(s)'));
      } finally {
        setUploading(false);
      }
    },
    [imageUrls.length, t]
  );


  const handleFileInputChange = useCallback(
    (e) => {
      handleImageUpload(Array.from(e.target.files || []));
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleImageUpload]
  );


  const removeImage = useCallback((index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImagePublicIds((prev) => prev.filter((_, i) => i !== index));
  }, []);


  const handleUploadAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);


  const handleUploadAreaKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleUploadAreaClick();
      }
    },
    [handleUploadAreaClick]
  );


  const preventDefaults = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);


  const handleDrop = useCallback(
    (e) => {
      preventDefaults(e);
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      handleImageUpload(files);
    },
    [handleImageUpload, preventDefaults]
  );


  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const ok = validateForm(formData, imageUrls.length);
      if (!ok) return;


      setLoading(true);
      try {
        await partnerService.createPartner({
          ...formData,
          partnerType: safeType,
          description: formData.description || null,
          imageUrls,
          imagePublicIds,
        });
        toast.success(t('partner.registration_success'));
        setTimeout(() => navigate('/Login'), 1500);
      } catch (err) {
        toast.error(err.response?.data?.message || t('partner.registration_error'));
      } finally {
        setLoading(false);
      }
    },[formData, imageUrls, imagePublicIds, navigate, safeType, t, validateForm]);
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onDragEnter={preventDefaults}
      onDragOver={preventDefaults}
    >
      <div className="absolute inset-0 bg-black/20"/>


      {/* Khung 1 cột: Form trung tâm */}
      
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl relative z-10 justify-center">
        <div className="p-4 md:p-6">
          {/* Logo → Home - CENTERED */}
          <div className="flex justify-center mb-6">
            <button 
              type="button"
              className="p-0 border-0 bg-transparent"
              aria-label={t('common.home', 'Home')}
              onClick={() => navigate('/')}
            >
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN"
                className="h-20 transition-transform duration-300 hover:scale-105"
              />
            </button>
          </div>


          {/* Title + Type pill */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {t('partner.partner_registration')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('partner.subtitle', 'Tell us about your business to get approved.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/PartnerTypeSelection')}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              aria-label={t('partner.change_type', 'Change type')}
              title={t('partner.change_type', 'Change type')}
            >
              <i className="fas fa-briefcase" />
<span className="text-sm font-medium">
   {safeType ? t(`partner.${safeType.toLowerCase()}`) : t('common.not_selected', '—')}
 </span>
              <i className="fas fa-edit ml-1 opacity-75" />
            </button>
          </div>


          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              id="fullName"
              name="fullName"
              label={t('partner.full_name', 'Full name')}
              value={formData.fullName}
              maxLength={255}
              required
              onChange={handleInputChange}
            />


            <FloatingInput
              id="companyName"
              name="companyName"
              label={t('partner.company_name', 'Company name')}
              value={formData.companyName}
              maxLength={255}
              required
              onChange={handleInputChange}
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                id="email"
                type="email"
                name="email"
                label={t('partner.email', 'Email')}
                value={formData.email}
                maxLength={255}
                required
                onChange={handleInputChange}
              />
              <FloatingInput
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                label={t('partner.phone_number', 'Phone')}
                value={formData.phoneNumber}
                maxLength={30}
                required
                onChange={handleInputChange}
              />
            </div>


            <FloatingTextarea
              id="description"
              name="description"
              label={t('partner.description', 'Business description')}
              value={formData.description}
              maxLength={1000}
              rows={3}
              onChange={handleInputChange}
            />


            {/* Upload ảnh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('partner.business_images', 'Business images')} *
              </label>


              <button
                type="button"
                onClick={handleUploadAreaClick}
                onKeyDown={handleUploadAreaKeyDown}
                onDrop={handleDrop}
                disabled={uploading}
                aria-describedby="upload-help"
                className="w-full border border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <i className="fas fa-cloud-upload-alt text-2xl mb-2" aria-hidden="true" />
                <p className="text-gray-800 text-sm font-medium">
                  {t('partner.drag_drop_images')}
                </p>
                <p id="upload-help" className="text-xs text-gray-500">
                  {t('partner.image_requirements', 'Upload up to 5 images (JPG, PNG, max 5MB each)')}
                </p>
              </button>


              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="sr-only"
              />


              {imageUrls.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {t('partner.uploaded_images', 'Uploaded images')} ({imageUrls.length}/{MAX_IMAGES})
                    </h3>
                    <span className="text-xs text-gray-500">
                      {t('partner.tip_best_quality', 'Tip: Clear storefront/portfolio shots work best')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {imageUrls.map((url, i) => (
                      <div key={imagePublicIds[i] || `${url}-${i}`} className="relative group">
                        <img
                          src={url}
                          alt={t('partner.preview_image', 'Preview image {{number}}', { number: i + 1 })}
                          className="w-full h-20 object-cover rounded-md border"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label={t('partner.remove_image', 'Remove image {{number}}', { number: i + 1 })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/PartnerTypeSelection')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                <i className="fas fa-arrow-left mr-2" />
                {t('common.back')}
              </button>


              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {(!canSubmit) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('partner.submitting')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2" />
                    {t('partner.submit_application')}
                  </>
                )}
              </button>
            </div>


            {/* Note */}
            <div
              role="note"
              className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-xs flex items-start"
            >
              <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-600" aria-hidden="true" />
              {t('partner.review_process_info')}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


/* ======== Floating Inputs ======== */
function FloatingInput({ id, name, label, type = 'text', ...rest }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        {...rest}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
        peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600
        peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
      >
        {label}
      </label>
    </div>
  );
}
FloatingInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
};
FloatingInput.defaultProps = { type: 'text' };


function FloatingTextarea({ id, name, label, rows = 3, ...rest }) {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={name}
        rows={rows}
        {...rest}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-gray-800"
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
        peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600
        peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
      >
        {label}
      </label>
    </div>
  );
}
FloatingTextarea.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  rows: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
};

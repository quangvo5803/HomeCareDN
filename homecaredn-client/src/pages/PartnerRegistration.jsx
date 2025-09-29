import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import partnerService from '../services/partnerService';
import { isSafeEmail } from '../utils/validateEmail';

const MAX_IMAGES = 5;

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

  // Redirect if no valid type
  useEffect(() => {
    if (!['Distributor', 'Contractor'].includes(partnerTypeFromUrl)) {
      navigate('/PartnerTypeSelection', { replace: true });
    }
  }, [partnerTypeFromUrl, navigate]);

  const handleInputChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback(async files => {
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

      setImageUrls(prev => [...prev, ...arr.map(x => x.url)]);
      setImagePublicIds(prev => [...prev, ...arr.map(x => x.publicId)]);
      toast.success(t('SUCCESS.UPLOAD', 'Uploaded successfully'));
    } catch {
      toast.error(t('ERROR.UPLOAD_FAILED', 'Failed to upload image(s)'));
    } finally {
      setUploading(false);
    }
  }, [imageUrls.length, t]);

  const handleFileInputChange = useCallback(e => {
    handleImageUpload(Array.from(e.target.files || []));
  }, [handleImageUpload]);

  const removeImage = useCallback(index => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImagePublicIds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadAreaClick = useCallback(() => {
    document.getElementById('image-upload')?.click();
  }, []);

  const handleUploadAreaKeyDown = useCallback(e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUploadAreaClick();
    }
  }, [handleUploadAreaClick]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error(t('partner.validation.full_name_required'));
      return false;
    }
    if (!formData.companyName.trim()) {
      toast.error(t('partner.validation.company_name_required'));
      return false;
    }
    if (!formData.email.trim() || !isSafeEmail(formData.email)) {
      toast.error(t('partner.validation.email_required'));
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error(t('partner.validation.phone_required'));
      return false;
    }
    if (formData.description.length > 1000) {
      toast.error(t('partner.validation.description_too_long'));
      return false;
    }
    if (imageUrls.length === 0) {
      toast.error(t('partner.validation.images_required'));
      return false;
    }
    return true;
  };

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await partnerService.createPartner({
        ...formData,
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
  }, [validateForm, formData, imageUrls, imagePublicIds, t, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png) center/cover no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label={t('common.home', 'Home')}
            className="text-white hover:opacity-80"
          >
            <img
              src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
              alt="HomeCareDN"
              className="h-8 invert"
            />
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-1">
            {t('partner.partner_registration')}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/PartnerTypeSelection')}
            aria-label={t('partner.change_type', 'Change type')}
            className="text-blue-100 hover:text-white"
          >
            <i className="fas fa-edit" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Full Name */}
          <FloatingInput
            id="fullName"
            name="fullName"
            label={t('partner.full_name', 'Full name')}
            value={formData.fullName}
            maxLength={255}
            required
            onChange={handleInputChange}
          />

          {/* Company Name */}
          <FloatingInput
            id="companyName"
            name="companyName"
            label={t('partner.company_name', 'Company name')}
            value={formData.companyName}
            maxLength={255}
            required
            onChange={handleInputChange}
          />

          {/* Email & Phone */}
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

          {/* Description */}
          <FloatingTextarea
            id="description"
            name="description"
            label={t('partner.description', 'Description')}
            value={formData.description}
            maxLength={1000}
            rows={3}
            onChange={handleInputChange}
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('partner.business_images', 'Business images')} *
            </label>
            <button
              type="button"
              onClick={handleUploadAreaClick}
              onKeyDown={handleUploadAreaKeyDown}
              disabled={uploading}
              aria-describedby="upload-help"
              className="w-full border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50/20 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <i className="fas fa-cloud-upload-alt text-2xl text-blue-400 mb-2" aria-hidden="true" />
              <p className="text-blue-600 text-sm font-medium">
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
              accept="image/*"
              onChange={handleFileInputChange}
              className="sr-only"
            />

            {imageUrls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('partner.uploaded_images', 'Uploaded images')} ({imageUrls.length}/{MAX_IMAGES})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={imagePublicIds[i]} className="relative group">
                      <img
                        src={url}
                        alt={t('partner.preview_image', 'Preview image {{number}}', { number: i + 1 })}
                        className="w-full h-16 object-cover rounded border"
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

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/PartnerTypeSelection')}
              className="flex-1 py-3 px-4 border rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
            >
              <i className="fas fa-arrow-left mr-2" /> {t('common.back')}
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`flex-1 py-3 px-4 rounded-lg text-white focus:ring-4 focus:ring-blue-300 ${
                loading || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading || uploading
                ? <span className="flex items-center justify-center"><svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>{t('partner.submitting')}
                  </span>
                : <><i className="fas fa-paper-plane mr-2" /> {t('partner.submit_application')}</>
              }
            </button>
          </div>

          <div role="note" className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-xs flex items-start">
            <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-600" aria-hidden="true" />
            {t('partner.review_process_info')}
          </div>
        </form>
      </div>
    </div>
  );
}

// Floating label input
function FloatingInput({ id, name, label, type = 'text', ...rest }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        {...rest}
        className="w-full px-4 py-3 border border-blue-500 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

// Floating label textarea
function FloatingTextarea({ id, name, label, rows, ...rest }) {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={name}
        rows={rows}
        {...rest}
        className="w-full px-4 py-3 border border-blue-500 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
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

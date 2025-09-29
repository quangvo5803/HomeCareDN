import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import partnerService from '../services/partnerService';

const PartnerRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const partnerTypeFromUrl = searchParams.get('type');
  
  const [formData, setFormData] = useState({
    partnerType: partnerTypeFromUrl || '',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (files) => {
    if (files.length + imageUrls.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newUrls = [];
    const newPublicIds = [];

    // Mock upload - replace with actual implementation
    for (let i = 0; i < files.length; i++) {
      const mockUrl = URL.createObjectURL(files[i]);
      const mockPublicId = `partner_${Date.now()}_${i}`;
      newUrls.push(mockUrl);
      newPublicIds.push(mockPublicId);
    }

    setImageUrls(prev => [...prev, ...newUrls]);
    setImagePublicIds(prev => [...prev, ...newPublicIds]);
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImagePublicIds(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.companyName || formData.companyName.length > 255) {
        toast.error(t('partner.validation.company_name_required'));
        return;
      }
      if (!formData.email) {
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
  };

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
              onClick={() => navigate('/')}
              className="transition-transform duration-300 transform hover:scale-105"
            >
              <img 
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN"
                className="h-8 filter brightness-0 invert"
              />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                {t('partner.partner_registration')}
              </h2>
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
              onClick={() => navigate('/PartnerTypeSelection')}
              className="text-blue-100 hover:text-white transition-colors p-1"
              title={t('partner.change_type')}
            >
              <i className="fas fa-edit"></i>
            </button>
          </div>
        </div>

        {/* Form Container với max height và scroll */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('partner.business_images')} *
              </label>
              
              <div 
                className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/30"
                onClick={() => document.getElementById('image-upload').click()}
              >
                <i className="fas fa-cloud-upload-alt text-2xl text-blue-400 mb-2"></i>
                <p className="text-blue-600 text-sm font-medium mb-1">
                  {t('partner.drag_drop_images')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('partner.image_requirements')}
                </p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                  className="hidden"
                />
              </div>

              {/* Image Preview */}
              {imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/PartnerTypeSelection')}
                className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                {t('common.back')}
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('partner.submitting')}
                  </span>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    {t('partner.submit_application')}
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-800 flex items-start">
                <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-600 text-sm"></i>
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

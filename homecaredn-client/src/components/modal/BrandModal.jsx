import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { handleApiError } from '../../utils/handleApiError';
import { uploadImageToCloudinary } from '../../utils/uploadImage';
import { useBrand } from '../../hook/useBrand';
import LoadingComponent from '../LoadingComponent';

export default function BrandModal({
  isOpen,
  onClose,
  onSave,
  brandID,
  setUploadProgress,
  setSubmitting,
}) {
  const { t } = useTranslation();
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandNameEN, setBrandNameEN] = useState('');
  const [brandDescriptionEN, setBrandDescriptionEN] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [brand, setBrand] = useState();

  const { loading, getBrandById } = useBrand();

  // Khi mở modal, nếu có brand (chế độ edit) thì fill dữ liệu
  useEffect(() => {
    const fetchBrand = async () => {
      if (isOpen) {
        if (brandID) {
          const result = await getBrandById(brandID);
          if (result) {
            setBrand(result);
            setBrandName(result.brandName || '');
            setBrandDescription(result.brandDescription || '');
            setBrandNameEN(result.brandNameEN || '');
            setBrandDescriptionEN(result.brandDescriptionEN || '');
            setLogoPreview(result.brandLogo || null);
            setLogoFile(null);
            setUploadProgress(0);
          }
          return;
        }
        setBrand(null);
        setBrandName('');
        setBrandDescription('');
        setBrandNameEN('');
        setBrandDescriptionEN('');
        setLogoFile(null);
        setLogoPreview(null);
        setUploadProgress(0);
      }
    };

    fetchBrand();
  }, [isOpen, brandID, getBrandById, setUploadProgress]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (!brandName.trim()) return toast.error(t('ERROR.REQUIRED_BRANDNAME'));
    if (!brand && !logoFile) return toast.error(t('ERROR.REQUIRED_BRANDLOGO'));

    try {
      const data = {
        BrandName: brandName,
        BrandDescription: brandDescription || null,
        BrandNameEN: brandNameEN || null,
        BrandDescriptionEN: brandDescriptionEN || null,

        ...(brand?.brandID && { BrandID: brand.brandID }),
      };

      if (logoFile) {
        setUploadProgress(1);
        const result = await uploadImageToCloudinary(
          logoFile,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          (percent) => {
            setUploadProgress(percent);
          },
          'HomeCareDN/BrandLogo'
        );
        data.BrandLogoUrl = result.url;
        data.BrandLogoPublicId = result.publicId;
        onClose();
        setUploadProgress(0);
      }

      await onSave(data);
    } catch (err) {
      toast.error(t(handleApiError(err)));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto 
                  transform transition-all duration-300 scale-100 
                  max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {brand
              ? t('adminBrandManager.brandModal.title2')
              : t('adminBrandManager.brandModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body (cuộn ở đây) */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingComponent />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminBrandManager.brandModal.brandName')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t(
                    'adminBrandManager.brandModal.brandNamePlaceholder'
                  )}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminBrandManager.brandModal.brandDescription')}
                </label>
                <textarea
                  placeholder={t(
                    'adminBrandManager.brandModal.brandDescriptionPlaceholder'
                  )}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                />
              </div>
              {/* Expand/Collapse */}
              <div>
                {/* Nút Expand/Collapse */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700"
                >
                  <i className="fas fa-globe"></i>
                  {t('adminBrandManager.brandModal.multilanguage_for_data')}
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Nội dung expand */}
                {isExpanded && (
                  <div className="p-3">
                    {/* Brand Name EN */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('adminBrandManager.brandModal.brandNameEN')}
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          'adminBrandManager.brandModal.brandNamePlaceholderEN'
                        )}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={brandNameEN}
                        onChange={(e) => setBrandNameEN(e.target.value)}
                      />
                    </div>

                    {/* Brand Description EN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('adminBrandManager.brandModal.brandDescriptionEN')}
                      </label>
                      <textarea
                        placeholder={t(
                          'adminBrandManager.brandModal.brandDescriptionPlaceholderEN'
                        )}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                        value={brandDescriptionEN}
                        onChange={(e) => setBrandDescriptionEN(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminBrandManager.brandModal.brandLogo')}{' '}
                  {brand ? '' : <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview ? (
                    <div className="w-full max-h-40 rounded-xl overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-full max-h-40 mt-2 rounded-xl object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-gray-400">Logo</span>
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50">
                    {logoFile
                      ? logoFile.name
                      : t('adminBrandManager.brandModal.chooseFile')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
            onClick={onClose}
          >
            {t('BUTTON.Cancel')}
          </button>
          <button
            className={`px-6 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed`}
            onClick={handleSubmit}
            disabled={!brandName.trim() || (!brand && !logoFile)}
          >
            {brand ? t('BUTTON.UpdateBrand') : t('BUTTON.AddNewBrand')}
          </button>
        </div>
      </div>
    </div>
  );
}
// PropTypes
BrandModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  brandID: PropTypes.string,
  setUploadProgress: PropTypes.func.isRequired,
  setSubmitting: PropTypes.func.isRequired,
};
// Default props
BrandModal.defaultProps = {
  brandID: null,
};

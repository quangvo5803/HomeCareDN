import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { uploadImageToCloudinary } from '../../utils/uploadImage';

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  setUploadProgress,
}) {
  const { t } = useTranslation();
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameEN, setCategoryNameEN] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  // Khi mở modal, nếu có category (edit) thì fill dữ liệu
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setCategoryName(category.categoryName || '');
        setCategoryNameEN(category.categoryNameEN || '');
        setLogoPreview(category.categoryLogo || null);
        setLogoFile(null);
        setIsActive(category.isActive ?? true);
        setUploadProgress(0);
      } else {
        setCategoryName('');
        setCategoryNameEN('');
        setLogoFile(null);
        setLogoPreview(null);
        setUploadProgress(0);
      }
    }
  }, [isOpen, category, setUploadProgress]);
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
    if (!categoryName.trim()) {
      return toast.error(t('ERROR.REQUIRED_CATEGORYNAME'));
    }
    if (!category && !logoFile)
      return toast.error(t('ERROR.REQUIRED_CATEGORYLOGO'));

    const data = {
      CategoryName: categoryName,
      CategoryNameEN: categoryNameEN || null,
    };

    if (category?.categoryID) {
      data.CategoryID = category.categoryID;
      data.IsActive = user?.role === 'Admin' ? isActive : false;
    } else {
      data.IsActive = user?.role === 'Admin';
      data.UserID = user?.id;
    }
    try {
      if (logoFile) {
        const result = await uploadImageToCloudinary(
          logoFile,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          () => {},
          'HomeCareDN/CategoryLogo'
        );
        data.CategoryLogoUrl = result.url;
        data.CategoryLogoPublicId = result.publicId;
      }

      await onSave(data);
    } catch (err) {
      toast.error(t(handleApiError(err)));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {category
              ? t('adminCategoryManager.categoryModal.title2') // Edit
              : t('adminCategoryManager.categoryModal.title')}{' '}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('adminCategoryManager.categoryModal.categoryName')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t(
                'adminCategoryManager.categoryModal.categoryNamePlaceholder'
              )}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          {/* Category Name English */}
          <div>
            {/* Nút Expand/Collapse */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2"
            >
              <i className="fas fa-globe"></i>
              {t('adminCategoryManager.categoryModal.multilanguage_for_data')}
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Nội dung expand */}
            {isExpanded && (
              <div className="p-3 space-y-4">
                {/* Category Name EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('adminCategoryManager.categoryModal.categoryNameEN')}
                  </label>
                  <input
                    type="text"
                    placeholder={t(
                      'adminCategoryManager.categoryModal.categoryNamePlaceholderEN'
                    )}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={categoryNameEN}
                    onChange={(e) => setCategoryNameEN(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('adminCategoryManager.categoryModal.categoryLogo')}{' '}
              {category ? '' : <span className="text-red-500">*</span>}
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
                  : t('adminCategoryManager.categoryModal.chooseFile')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          {user?.role === 'Admin' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminCategoryManager.categoryModal.isActive')}
              </label>
              <select
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value === 'true')}
              >
                <option value="true">{t('BUTTON.Activate')}</option>
                <option value="false">{t('BUTTON.Deactivate')}</option>
              </select>
            </div>
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
            className="px-6 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={
              !categoryName.trim() || (!logoFile && !logoPreview && !category)
            } // Bắt buộc tên và logo (nếu tạo mới)
          >
            {category ? t('BUTTON.UpdateCategory') : t('BUTTON.AddNewCategory')}
          </button>
        </div>
      </div>
    </div>
  );
}
// PropTypes
CategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  category: PropTypes.shape({
    categoryID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categoryName: PropTypes.string,
    categoryNameEN: PropTypes.string,
    categoryLogo: PropTypes.string,
    isActive: PropTypes.bool,
  }),
};

// Default props
CategoryModal.defaultProps = {
  category: null,
};

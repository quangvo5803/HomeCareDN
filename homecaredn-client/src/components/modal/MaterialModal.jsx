import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMaterial } from '../../hook/useMaterial';
import { useAuth } from '../../hook/useAuth';
import Swal from 'sweetalert2';
import { showDeleteModal } from './DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import { uploadImageToCloudinary } from '../../utils/uploadImage';
import LoadingModal from './LoadingModal';

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
export default function MaterialModal({
  isOpen,
  onClose,
  onSave,
  materialID,
  brands,
  categories,
  setUploadProgress,
  readOnly,
}) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { deleteMaterialImage } = useMaterial();

  const [name, setName] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [brandID, setBrandID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [unit, setUnit] = useState('');
  const [unitEN, setUnitEN] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const [images, setImages] = useState([]);

  const [material, setMaterial] = useState();
  const { loading, getMaterialById } = useMaterial();
  // Fill data khi edit
  useEffect(() => {
    const fetchMaterial = async () => {
      if (isOpen) {
        if (materialID) {
          const result = await getMaterialById(materialID);
          if (result) {
            setMaterial(result);
            const foundBrand = brands.find(
              (b) => b.brandName === result.brandName
            );
            const foundCategory = categories.find(
              (c) => c.categoryName === result.categoryName
            );
            setName(result.name || '');
            setNameEN(result.nameEN || '');
            setUnit(result.unit || '');
            setUnitEN(result.unitEN || '');
            setBrandID(foundBrand?.brandID || '');
            setCategoryID(foundCategory?.categoryID || '');
            setDescription(result.description || '');
            setDescriptionEN(result.descriptionEN || '');
            setImages(
              (result.imageUrls || []).map((url) => ({
                url,
                isNew: false,
              }))
            );
            setUploadProgress(0);
          }
          return;
        }
        setMaterial(null);
        setName('');
        setNameEN('');
        setUnit('');
        setUnitEN('');
        setBrandID('');
        setCategoryID('');
        setDescription('');
        setDescriptionEN('');
        setImages([]);
        setUploadProgress(0);
      }
    };
    fetchMaterial();
  }, [
    isOpen,
    materialID,
    brands,
    categories,
    getMaterialById,
    setUploadProgress,
  ]);

  // Chọn ảnh local
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const totalImages = images.length + files.length;
    if (totalImages > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }

    const mappedFiles = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...mappedFiles]);
  };

  // Xóa ảnh local hoặc DB
  const removeImageFromState = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));

    if (!img.isNew && material) {
      material.imageUrls = material.imageUrls.filter((url) => url !== img.url);
    }
  };

  const confirmDeleteImage = async (img) => {
    try {
      await deleteMaterialImage(material.materialID, img.url);
      Swal.close();
      toast.success(t('SUCCESS.DELETE'));
      removeImageFromState(img);
    } catch (error) {
      console.error(error);
      toast.error(t('ERROR.DELETE'));
    }
  };

  const handleRemoveImage = (img) => {
    if (img.isNew) {
      removeImageFromState(img);
    } else {
      showDeleteModal({
        t,
        titleKey: t('ModalPopup.DeleteImageModal.title'),
        textKey: t('ModalPopup.DeleteImageModal.text'),
        onConfirm: () => confirmDeleteImage(img),
      });
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_NAME'));
      return;
    }
    if (!unit.trim()) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_UNIT'));
      return;
    }
    if (!brandID.trim()) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_BRAND'));
      return;
    }
    if (!categoryID.trim()) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_CATEGORY'));
      return;
    }
    if (!material && images.filter((i) => i.isNew).length === 0) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_IMAGES'));
      return;
    }

    try {
      const newFiles = images.filter((i) => i.isNew).map((i) => i.file);

      const data = {
        MaterialID: material?.materialID,
        UserID: user?.id || null,
        Name: name || null,
        NameEN: nameEN || null,
        Unit: unit || null,
        UnitEN: unitEN || null,
        BrandID: brandID || null,
        CategoryID: categoryID || null,
        Description: description || null,
        DescriptionEN: descriptionEN || null,
      };

      if (newFiles.length > 0) {
        const uploaded = await uploadImageToCloudinary(
          newFiles,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          (percent) => setUploadProgress(percent),
          'HomeCareDN/Material'
        );
        const uploadedArray = Array.isArray(uploaded) ? uploaded : [uploaded];
        data.ImageUrls = uploadedArray.map((u) => u.url);
        data.ImagePublicIds = uploadedArray.map((u) => u.publicId);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">
            {material ? t('BUTTON.UpdateMaterial') : t('BUTTON.AddNewMaterial')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors duration-200 rounded-full hover:text-gray-600 hover:bg-gray-100"
          >
            <i className="text-lg fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 pr-2 mt-4 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingModal />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {/* Material Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {t('distributorMaterialManager.materialModal.materialName')}
                    <span className="text-red-500 ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {t('distributorMaterialManager.materialModal.unit')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border rounded-xl"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {t('distributorMaterialManager.materialModal.brand')}
                    <span className="text-red-500 ms-1">*</span>
                  </label>
                  <select
                    value={brandID || ''}
                    onChange={(e) => setBrandID(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    {!material && (
                      <option value="">
                        {t(
                          'distributorMaterialManager.materialModal.chooseBrand'
                        )}
                      </option>
                    )}
                    {brands.map((b) => (
                      <option key={b.brandID} value={b.brandID}>
                        {i18n.language === 'vi'
                          ? b.brandName
                          : b.brandNameEN || b.brandName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {t('distributorMaterialManager.materialModal.category')}
                    <span className="text-red-500 ms-1">*</span>
                  </label>
                  <select
                    value={categoryID || ''}
                    onChange={(e) => setCategoryID(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    {!material && (
                      <option value="">
                        {t(
                          'distributorMaterialManager.materialModal.chooseCategory'
                        )}
                      </option>
                    )}
                    {categories.map((c) => (
                      <option key={c.categoryID} value={c.categoryID}>
                        {i18n.language === 'vi'
                          ? c.categoryName
                          : c.categoryNameEN || c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {t('distributorMaterialManager.materialModal.description')}
                  </label>
                  <Editor
                    value={description}
                    init={{
                      license_key: 'gpl',
                      height: 300,
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

                {/* Multilanguage */}
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700"
                  >
                    <i className="fas fa-globe text-emerald-500"></i>
                    {t(
                      'distributorMaterialManager.materialModal.multilanguage_for_data'
                    )}
                    <span className="ml-auto">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="p-5 space-y-4 rounded-xl bg-gray-50">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t(
                              'distributorMaterialManager.materialModal.materialNameEN'
                            )}
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 border rounded-xl"
                            value={nameEN}
                            onChange={(e) => setNameEN(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t(
                              'distributorMaterialManager.materialModal.unitEN'
                            )}
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 border rounded-xl"
                            value={unitEN}
                            onChange={(e) => setUnitEN(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          {t(
                            'distributorMaterialManager.materialModal.descriptionEN'
                          )}
                        </label>
                        <Editor
                          value={descriptionEN}
                          init={{
                            license_key: 'gpl',
                            height: 300,
                            menubar: false,
                            plugins: 'lists link image code',
                            toolbar:
                              'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
                            skin: false,
                            content_css: false,
                          }}
                          onEditorChange={(content) =>
                            setDescriptionEN(content)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="flex flex-wrap col-span-2 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.url}
                      className="relative overflow-hidden border w-28 h-28 rounded-xl group"
                    >
                      <img
                        src={img.url}
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                      {!readOnly && (
                        <div className="absolute inset-0 transition opacity-0 bg-black/30 group-hover:opacity-100">
                          {(images.length !== 1 || img.isNew) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!readOnly && images.length < 5 && (
                  <div className="col-span-2">
                    <label className="inline-block px-4 py-2 border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-emerald-400 hover:bg-emerald-50">
                      {t('distributorMaterialManager.materialModal.chooseFile')}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    <span className="ml-3 text-sm text-gray-500">
                      {images.filter((i) => i.isNew).length > 0
                        ? `${images.filter((i) => i.isNew).length} ${t(
                            'distributorMaterialManager.materialModal.filesSelected'
                          )}`
                        : t('distributorMaterialManager.materialModal.noFile')}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 pt-4 mt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
          >
            {t('BUTTON.Cancel')}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600"
            >
              {material ? t('BUTTON.Update') : t('BUTTON.Add')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

MaterialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  materialID: PropTypes.string,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  setUploadProgress: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

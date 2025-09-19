import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMaterial } from '../../hook/useMaterial';
import { useAuth } from '../../hook/useAuth';
import Swal from 'sweetalert2';
import { Editor } from '@tinymce/tinymce-react';
import { showDeleteModal } from './DeleteModal';

export default function MaterialModal({
  isOpen,
  onClose,
  onSave,
  material,
  brands,
  categories,
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

  // Fill data khi edit
  useEffect(() => {
    if (isOpen) {
      if (material) {
        const foundBrand = brands.find(
          (b) => b.brandName === material.brandName
        );
        const foundCategory = categories.find(
          (c) => c.categoryName === material.categoryName
        );
        setName(material.name || '');
        setNameEN(material.nameEN || '');
        setUnit(material.unit || '');
        setUnitEN(material.unitEN || '');
        setBrandID(foundBrand?.brandID || '');
        setCategoryID(foundCategory?.categoryID || '');
        setDescription(material.description || '');
        setDescriptionEN(material.descriptionEN || '');
        setImages(
          (material.imageUrls || []).map((url) => ({
            id: url,
            url,
            isNew: false,
          }))
        );
      } else {
        setName('');
        setNameEN('');
        setUnit('');
        setUnitEN('');
        setBrandID('');
        setCategoryID('');
        setDescription('');
        setDescriptionEN('');
        setImages([]);
      }
    }
  }, [isOpen, material, brands, categories]);

  // Chọn ảnh local
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = images.length + files.length;
    if (totalCount > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }

    const mappedFiles = files.map((f) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f),
      file: f,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...mappedFiles]);
  };

  // Xóa ảnh local hoặc DB
  const removeImageFromState = (img) => {
    setImages((prev) => prev.filter((i) => i.id !== img.id));
    if (material) {
      material.imageUrls = material.imageUrls.filter((url) => url !== img.url);
    }
  };

  const confirmDeleteImage = async (img) => {
    try {
      await deleteMaterialImage(material.MaterialID, img.url);
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
  const handleSubmit = () => {
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
      Images: images.filter((i) => i.isNew).map((i) => i.file),
    };
    onSave(data);
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Material Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('distributorMaterialManager.materialModal.materialName')}
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
              </label>
              <select
                value={brandID || ''}
                onChange={(e) => setBrandID(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                {!material && (
                  <option value="">
                    {t('distributorMaterialManager.materialModal.chooseBrand')}
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
                apiKey="txa9frhpdx819f6c5lzpoon7cldog6r6cjn578dgp43cfi7x"
                value={description}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: 'lists link image code',
                  toolbar:
                    'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
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
                        {t('distributorMaterialManager.materialModal.unitEN')}
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
                      apiKey="txa9frhpdx819f6c5lzpoon7cldog6r6cjn578dgp43cfi7x"
                      value={descriptionEN}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: 'lists link image code',
                        toolbar:
                          'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
                      }}
                      onEditorChange={(content) => setDescriptionEN(content)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="col-span-2 flex flex-wrap gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative w-28 h-28 border rounded-xl overflow-hidden group"
                >
                  <img
                    src={img.url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
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
                </div>
              ))}
            </div>

            {images.length < 5 && (
              <div className="col-span-2">
                <label className="cursor-pointer px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 inline-block">
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end mt-6 gap-4 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
          >
            {t('BUTTON.Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600"
          >
            {material ? t('BUTTON.Update') : t('BUTTON.Add')}
          </button>
        </div>
      </div>
    </div>
  );
}

MaterialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  material: PropTypes.object,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
};

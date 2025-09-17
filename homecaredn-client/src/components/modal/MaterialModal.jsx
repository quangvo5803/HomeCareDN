import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useBrand } from '../../hook/useBrand';
import { useCategory } from '../../hook/useCategory';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/handleApiError';
import { useMaterial } from '../../hook/useMaterial';
import { useAuth } from '../../hook/useAuth';
import { Editor } from '@tinymce/tinymce-react';

export default function MaterialModal({ isOpen, onClose, onSave, material }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { deleteMaterialImage } = useMaterial();
  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();

  const [name, setName] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [brandID, setBrandID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [unit, setUnit] = useState('');
  const [unitEN, setUnitEN] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);

  // Ảnh DB
  const [existingImages, setExistingImages] = useState([]);
  // Ảnh local mới upload
  const [newImages, setNewImages] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  // Load brands & categories cho dropdown
  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const [brandList, categoryList] = await Promise.all([
            fetchAllBrands(),
            fetchAllCategories({ FilterBool: true }),
          ]);
          setBrands(brandList);
          setCategories(categoryList);
        } catch (err) {
          toast.error(handleApiError(err));
        }
      })();
    }
  }, [isOpen, fetchAllBrands, fetchAllCategories]);
  // Delete Material image (DB)
  const handleDeleteImage = async (imageUrl, onSuccess) => {
    Swal.fire({
      title: t('ModalPopup.DeleteMaterialImageModal.title'),
      text: t('ModalPopup.DeleteMaterialImageModal.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('BUTTON.Delete'),
      cancelButtonText: t('BUTTON.Cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: t('ModalPopup.DeletingLoadingModal.title'),
            text: t('ModalPopup.DeletingLoadingModal.text'),
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          await deleteMaterialImage(imageUrl);
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
          if (onSuccess) onSuccess();
        } catch (err) {
          Swal.close();
          if (err.handled) return;
          toast.error(handleApiError(err));
        }
      }
    });
  };

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
        setBrandID(material.brandID || foundBrand?.brandID || '');
        setCategoryID(material.categoryID || foundCategory?.categoryID || '');
        setUnit(material.unit || '');
        setDescription(material.description || '');
        setNameEN(material.nameEN || '');
        setUnitEN(material.unitEN || '');
        setDescriptionEN(material.descriptionEN || '');
        setExistingImages(material.imageUrls || []);
        setNewImages([]);
      } else {
        setName('');
        setBrandID('');
        setCategoryID('');
        setUnit('');
        setDescription('');
        setNameEN('');
        setUnitEN('');
        setDescriptionEN('');
        setExistingImages([]);
        setNewImages([]);
      }
    }
  }, [isOpen, material, brands, categories]);

  // Chọn và hiển thị ảnh local
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newImages.length + files.length;
    if (totalCount > 5) {
      toast.error(t('ERROR.REQUIRED_MATERIAL_IMAGE'));
      return;
    }

    // Gán id cho từng ảnh local
    const mappedFiles = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    setNewImages((prev) => [...prev, ...mappedFiles]);
  };

  // Xóa ảnh local theo id
  const handleRemoveNewImage = (id) => {
    setNewImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Hàm phụ để update state sau khi xoá ảnh
  const updateExistingImages = (imageUrl) => {
    setExistingImages((prev) => prev.filter((x) => x !== imageUrl));
    if (material) {
      material.imageUrls = material.imageUrls.filter((x) => x !== imageUrl);
    }
  };

  // Hàm chính để gọi xoá ảnh
  const handleRemoveExistingImage = (imageUrl) => {
    handleDeleteImage(imageUrl, () => updateExistingImages(imageUrl));
  };

  // Submit update/add
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
    if (!material && newImages.length === 0) {
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
      Images: newImages.length > 0 ? newImages.map((x) => x.file) : null,
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

        {/* Body (scrollable) */}
        <div className="flex-1 pr-2 mt-4 space-y-6 overflow-y-auto">
          {/* Form */}
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

            {/* Expand */}
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
                    {/* Material Name EN */}
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

                    {/* Unit EN */}
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

                  {/* Description EN */}
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
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('distributorMaterialManager.materialModal.images')}
              </label>

              {existingImages.length + newImages.length < 5 && (
                <div>
                  {/* Hidden file input */}
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Custom button */}
                  <label
                    htmlFor="fileUpload"
                    className="inline-block px-4 py-2 font-medium border rounded-lg cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                  >
                    {t('distributorMaterialManager.materialModal.chooseFile')}
                  </label>

                  {/* Hiển thị số file đã chọn */}
                  <span className="ml-3 text-sm text-gray-500">
                    {newImages.length > 0
                      ? `${newImages.length} ${t(
                        'distributorMaterialManager.materialModal.filesSelected'
                      )}`
                      : t('distributorMaterialManager.materialModal.noFile')}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-4 mt-4">
                {/* Existing Images */}
                {existingImages.map((imgUrl) => (
                  <div
                    key={imgUrl}
                    className="relative flex items-center justify-center w-24 h-24 overflow-hidden bg-white border rounded-lg shadow-sm group"
                  >
                    <img
                      src={imgUrl}
                      alt="db"
                      className="max-w-[83px] max-h-[83px] object-contain"
                    />
                    <div className="absolute inset-0 transition opacity-0 bg-black/30 group-hover:opacity-100">
                      {existingImages.length !== 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imgUrl)}
                          className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* New Images local */}
                {newImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative flex items-center justify-center w-24 h-24 overflow-hidden bg-white border rounded-lg shadow-sm group"
                  >
                    <img
                      src={img.previewUrl}
                      alt="new"
                      className="max-w-[83px] max-h-[83px] object-contain"
                    />
                    <div className="absolute inset-0 transition opacity-0 bg-black/30 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(img.id)}
                        className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-xl hover:bg-gray-50"
          >
            {t('BUTTON.Cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-white shadow bg-emerald-500 rounded-xl hover:bg-emerald-600"
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
};

MaterialModal.defaultProps = {
  material: null,
};

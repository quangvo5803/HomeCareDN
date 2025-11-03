import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useEnums } from '../../hook/useEnums';
import { useService } from '../../hook/useService';
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

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  serviceID,
  setUploadProgress,
}) {
  const { t } = useTranslation();
  const enums = useEnums();
  const { loading, getServiceById, deleteServiceImage } = useService();

  const [name, setName] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [packageOption, setPackageOption] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [mainStructureType, setMainStructureType] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState([]);

  const [service, setService] = useState();
  // Fill dữ liệu khi mở modal
  useEffect(() => {
    const fetchService = async () => {
      if (isOpen) {
        if (serviceID) {
          const result = await getServiceById(serviceID);
          if (result) {
            setService(result);
            setName(result.name || '');
            setNameEN(result.nameEN || '');
            setDescription(result.description || '');
            setDescriptionEN(result.descriptionEN || '');
            setServiceType(result.serviceType ?? '');
            setPackageOption(result.packageOption ?? '');
            setBuildingType(result.buildingType ?? '');
            setMainStructureType(result.mainStructureType ?? '');
            setDesignStyle(result.designStyle ?? '');
            setImages(
              (result.imageUrls || []).map((url) => ({
                url,
                isNew: false,
              }))
            );
            setUploadProgress(0);
            return;
          }
        }
        setName('');
        setNameEN('');
        setDescription('');
        setDescriptionEN('');
        setServiceType('');
        setPackageOption('');
        setBuildingType('');
        setMainStructureType('');
        setDesignStyle('');
        setImages([]);
        setUploadProgress(0);
      }
    };
    fetchService();
  }, [isOpen, serviceID, getServiceById, setUploadProgress]);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const totalCount = images.length + files.length;
    if (totalCount > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    const mappedFiles = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      isNew: true,
    }));
    setImages((prev) => [...prev, ...mappedFiles]);
  };

  // Xoá ảnh khỏi state
  const removeImageFromState = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };

  // Hàm xoá ảnh (local hoặc DB)
  const handleRemoveImage = (img) => {
    if (img.isNew) {
      //  Ảnh mới chỉ xoá state
      removeImageFromState(img);
    } else {
      //  Ảnh cũ confirm + gọi API
      showDeleteModal({
        t,
        titleKey: t('ModalPopup.DeleteImageModal.title'),
        textKey: t('ModalPopup.DeleteImageModal.text'),
        onConfirm: async () => {
          try {
            await deleteServiceImage(service.serviceID, img.url);
            Swal.close();
            toast.success(t('SUCCESS.DELETE'));
            removeImageFromState(img);
          } catch {
            toast.error(t('ERROR.DELETE'));
          }
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t('ERROR.REQUIRED_SERVICENAME'));
      return;
    }
    if (!serviceType) {
      toast.error(t('ERROR.REQUIRED_SERVICETYPE'));
      return;
    }
    if (!buildingType) {
      toast.error(t('ERROR.REQUIRED_BUILDINGTYPE'));
      return;
    }
    try {
      const newFiles = images.filter((i) => i.isNew).map((i) => i.file);
      const data = {
        Name: name,
        NameEN: nameEN || null,
        Description: description || null,
        DescriptionEN: descriptionEN || null,
        ServiceType: serviceType,
        PackageOption: packageOption || null,
        BuildingType: buildingType,
        MainStructureType: mainStructureType || null,
        DesignStyle: designStyle || null,
      };
      if (images.length > 5) {
        toast.error(t('ERROR.MAXIMUM_IMAGE'));
        return;
      }
      if (service?.serviceID) {
        data.ServiceID = service.serviceID;
      }

      if (newFiles.length > 0) {
        const uploaded = await uploadImageToCloudinary(
          newFiles,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          (percent) => setUploadProgress(percent),
          'HomeCareDN/Service'
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
    <div className="fixed inset-0 flex items-center justify-center z-[1050] p-4 bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto 
                  transform transition-all duration-300 scale-100 
                  max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {service
              ? t('adminServiceManager.serviceModal.title2')
              : t('adminServiceManager.serviceModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 transition-colors duration-200 rounded-lg hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingModal />
            </div>
          ) : (
            <>
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminServiceManager.serviceModal.serviceName')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminServiceManager.serviceModal.serviceDescription')}
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

              {/* Enums dropdown */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* ServiceType */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('adminServiceManager.serviceModal.serviceType')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border rounded-xl"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="">
                      {t(
                        'adminServiceManager.serviceModal.serviceTypePlaceholder'
                      )}
                    </option>
                    {enums?.serviceTypes?.map((s) => (
                      <option key={s.value} value={s.value}>
                        {t(`Enums.ServiceType.${s.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PackageOption */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('adminServiceManager.serviceModal.packageOption')}
                  </label>
                  <select
                    className="w-full px-4 py-3 border rounded-xl"
                    value={packageOption}
                    onChange={(e) => setPackageOption(e.target.value)}
                  >
                    <option value="">
                      {t(
                        'adminServiceManager.serviceModal.packageOptionPlaceholder'
                      )}
                    </option>
                    {enums?.packageOptions?.map((p) => (
                      <option key={p.value} value={p.value}>
                        {t(`Enums.PackageOption.${p.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BuildingType */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('adminServiceManager.serviceModal.buildingType')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border rounded-xl"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                  >
                    <option value="">
                      {t(
                        'adminServiceManager.serviceModal.buildingTypePlaceholder'
                      )}
                    </option>
                    {enums?.buildingTypes?.map((b) => (
                      <option key={b.value} value={b.value}>
                        {t(`Enums.BuildingType.${b.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MainStructureType */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('adminServiceManager.serviceModal.mainStructureType')}{' '}
                  </label>
                  <select
                    className="w-full px-4 py-3 border rounded-xl"
                    value={mainStructureType}
                    onChange={(e) => setMainStructureType(e.target.value)}
                  >
                    <option value="">
                      {t(
                        'adminServiceManager.serviceModal.mainStructureTypePlaceholder'
                      )}
                    </option>
                    {enums?.mainStructures?.map((m) => (
                      <option key={m.value} value={m.value}>
                        {t(`Enums.MainStructure.${m.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DesignStyle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('adminServiceManager.serviceModal.designStyle')}
                  </label>
                  <select
                    className="w-full px-4 py-3 border rounded-xl"
                    value={designStyle}
                    onChange={(e) => setDesignStyle(e.target.value)}
                  >
                    <option value="">
                      {t(
                        'adminServiceManager.serviceModal.designStylePlaceholder'
                      )}
                    </option>
                    {enums?.designStyles?.map((d) => (
                      <option key={d.value} value={d.value}>
                        {t(`Enums.DesignStyle.${d.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expand for EN */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  <i className="fas fa-globe"></i>
                  {t('adminServiceManager.serviceModal.multilanguage_for_data')}
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="p-3">
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        {t('adminServiceManager.serviceModal.serviceNameEN')}
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-xl"
                        value={nameEN}
                        onChange={(e) => setNameEN(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        {t(
                          'adminServiceManager.serviceModal.serviceDescriptionEN'
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
                        onEditorChange={(content) => setDescriptionEN(content)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Images */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminServiceManager.serviceModal.images')}
                </label>
                <div className="flex flex-wrap gap-3">
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
                      <div className="absolute inset-0 transition opacity-0 bg-black/30 group-hover:opacity-100">
                        {(images.length !== 1 || img.isNew) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img)}
                            className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <label className="inline-block px-4 py-3 border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-blue-400 hover:bg-blue-50">
                  {t('adminServiceManager.serviceModal.chooseFiles')}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
            onClick={onClose}
          >
            {t('BUTTON.Cancel')}
          </button>
          <button
            className="px-6 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleSubmit}
            disabled={
              !name.trim() ||
              !serviceType ||
              !buildingType ||
              images.length === 0
            }
          >
            {service ? t('BUTTON.Update') : t('BUTTON.Add')}
          </button>
        </div>
      </div>
    </div>
  );
}

// PropTypes
ServiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  serviceID: PropTypes.string,
  setUploadProgress: PropTypes.func.isRequired,
};

// Default props
ServiceModal.defaultProps = {
  serviceID: null,
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useEnums } from '@/hooks/useEnums';

export default function ServiceModal({ isOpen, onClose, onSave, service }) {
  const { t } = useTranslation();
  const enums = useEnums();

  const [name, setName] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [packageOption, setPackageOption] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [mainStructureType, setMainStructureType] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fill dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setName(service.name || '');
        setNameEN(service.nameEN || '');
        setDescription(service.description || '');
        setDescriptionEN(service.descriptionEN || '');
        setServiceType(service.serviceType ?? '');
        setPackageOption(service.packageOption ?? '');
        setBuildingType(service.buildingType ?? '');
        setPreviewImages(service.images || []);
        setImages([]);
      } else {
        setName('');
        setNameEN('');
        setDescription('');
        setDescriptionEN('');
        setServiceType('');
        setPackageOption('');
        setBuildingType('');
        setPreviewImages([]);
        setImages([]);
      }
    }
  }, [isOpen, service]);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = () => {
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

    const data = {
      Name: name,
      NameEN: nameEN || null,
      Description: description || null,
      DescriptionEN: descriptionEN || null,
      ServiceType: serviceType,
      PackageOption: packageOption || null,
      BuildingType: buildingType,
    };

    if (service?.serviceID) {
      data.ServiceID = service.serviceID;
    }

    if (images.length > 0) {
      data.Images = images;
    }

    onSave(data);
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
            {service
              ? t('adminServiceManager.serviceModal.title2')
              : t('adminServiceManager.serviceModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
              {t('adminServiceManager.serviceModal.description')}
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Enums dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {t('adminServiceManager.serviceModal.serviceTypePlaceholder')}
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
                  {t('adminServiceManager.serviceModal.buildTypePlaceholder')}
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
                <span className="text-red-500">*</span>
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
                  {t('adminServiceManager.serviceModal.designStylePlaceholder')}
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
              className="flex items-center gap-1 text-sm font-medium text-gray-700"
            >
              <i className="fas fa-globe"></i>
              {t('adminServiceManager.serviceModal.multilanguage_for_data')}
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div className="p-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('adminServiceManager.serviceModal.descriptionEN')}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border rounded-xl resize-none"
                    rows="3"
                    value={descriptionEN}
                    onChange={(e) => setDescriptionEN(e.target.value)}
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
              {previewImages.map((src, idx) => (
                <div
                  key={idx}
                  className="w-28 h-28 border rounded-xl overflow-hidden relative"
                >
                  <img
                    src={src}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <label className="cursor-pointer px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 inline-block">
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
            disabled={!name.trim() || !serviceType || !buildingType}
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
  service: PropTypes.shape({
    serviceID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    nameEN: PropTypes.string,
    description: PropTypes.string,
    descriptionEN: PropTypes.string,
    serviceType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    packageOption: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buildingType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    images: PropTypes.array,
  }),
};

// Default props
ServiceModal.defaultProps = {
  service: null,
};

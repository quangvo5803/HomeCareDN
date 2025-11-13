import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { usePartnerRequest } from '../hook/usePartnerRequest';
import { isSafeEmail } from '../utils/validateEmail';
import { isSafePhone } from '../utils/validatePhone';
import Loading from '../components/Loading';
import { handleApiError } from '../utils/handleApiError';

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

export default function PartnerRegistration() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerTypeFromUrl = searchParams.get('partnerRequestType');
  const { loading, createPartnerRequest } = usePartnerRequest();

  const [partnerRequestType, setPartnerRequestType] =
    useState(partnerTypeFromUrl);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageProgress, setImageProgress] = useState({ loaded: 0, total: 0 });
  const [documentProgress, setDocumentProgress] = useState({
    loaded: 0,
    total: 0,
  });

  //Reset form
  useEffect(() => {
    setPartnerRequestType(partnerTypeFromUrl);
    setCompanyName('');
    setEmail('');
    setPhoneNumber('');
    setDescription('');
    setImages([]);
    setUploadProgress(0);
    setImageProgress({ loaded: 0, total: 0 });
    setDocumentProgress({ loaded: 0, total: 0 });
  }, [partnerTypeFromUrl, setUploadProgress]);

  // Update overall upload progress when image or document progress changes
  useEffect(() => {
    const totalLoaded = imageProgress.loaded + documentProgress.loaded;
    const totalSize = imageProgress.total + documentProgress.total;

    if (totalSize === 0) {
      if (uploadProgress !== 1) setUploadProgress(0);
      return;
    }
    const percent = Math.min(100, Math.round((totalLoaded * 100) / totalSize));
    setUploadProgress(percent);
  }, [imageProgress, documentProgress, uploadProgress]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const handleRemoveImage = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + documents.length > 5) {
      toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
      return;
    }
    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
      name: file.name,
    }));
    setDocuments((prev) => [...prev, ...mapped]);
  };

  const handleRemoveDocument = (doc) => {
    setDocuments((prev) => prev.filter((d) => d.url !== doc.url));
  };

  const getDocumentIcon = (fileName) => {
    if (!fileName) return 'fas fa-file text-gray-400';
    if (fileName.endsWith('.pdf')) {
      return 'fas fa-file-pdf text-red-500';
    }
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'fas fa-file-word text-blue-500';
    }
    if (fileName.endsWith('.txt')) {
      return 'fas fa-file-alt text-gray-500';
    }
    return 'fas fa-file text-gray-400';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!partnerRequestType) {
      toast.error(t('ERROR.NULL_PARTNERTYPE'));
      return;
    }
    if (!email || !isSafeEmail(email)) {
      toast.error(!email ? t('ERROR.NULL_EMAIL') : t('ERROR.INVALID_EMAIL'));
      return;
    }
    if (!companyName) {
      toast.error(t('ERROR.NULL_COMPANYNAME'));
      return;
    }
    if (!phoneNumber || !isSafePhone(phoneNumber)) {
      toast.error(
        !phoneNumber ? t('ERROR.NULL_PHONE') : t('ERROR.INVALID_PHONE')
      );
      return;
    }
    if (images.length > MAX_IMAGES) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    if (documents.length > MAX_DOCUMENTS) {
      toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
      return;
    }

    // File filtering
    const newImageFiles = images.filter((i) => i.file).map((i) => i.file); // Kiểm tra i.file tồn tại
    const newDocumentFiles = documents.filter((d) => d.file).map((d) => d.file);

    const payload = {
      PartnerRequestType: partnerRequestType,
      CompanyName: companyName,
      Email: email,
      PhoneNumber: phoneNumber,
      Description: description,
    };

    try {
      setImageProgress({
        loaded: 0,
        total: newImageFiles.reduce((sum, f) => sum + f.size, 0),
      });
      setDocumentProgress({
        loaded: 0,
        total: newDocumentFiles.reduce((sum, f) => sum + f.size, 0),
      });
      if (newImageFiles.length > 0 || newDocumentFiles.length > 0) {
        setUploadProgress(1);
      }

      // Tạo promises
      const imageUploadPromise =
        newImageFiles.length > 0
          ? uploadToCloudinary(
              newImageFiles,
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
              (progress) => setImageProgress(progress),
              'HomeCareDN/PartnerRequest'
            )
          : Promise.resolve(null);

      const documentUploadPromise =
        newDocumentFiles.length > 0
          ? uploadToCloudinary(
              newDocumentFiles,
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
              (progress) => setDocumentProgress(progress),
              'HomeCareDN/PartnerRequest/Documents',
              'raw'
            )
          : Promise.resolve(null);

      const [imageResults, documentResults] = await Promise.all([
        imageUploadPromise,
        documentUploadPromise,
      ]);

      // Gắn kết quả vào payload
      if (imageResults) {
        const arr = Array.isArray(imageResults) ? imageResults : [imageResults];
        payload.ImageUrls = arr.map((u) => u.url);
        payload.ImagePublicIds = arr.map((u) => u.publicId);
      }
      if (documentResults) {
        const arr = Array.isArray(documentResults)
          ? documentResults
          : [documentResults];
        payload.DocumentUrls = arr.map((u) => u.url);
        payload.DocumentPublicIds = arr.map((u) => u.publicId);
      }

      await createPartnerRequest(payload);
      toast.success(t('SUCCESS.PARTNER_REQUEST_ADD'));
      navigate('/Login');
    } catch (error) {
      toast.error(t(handleApiError(error)));
    } finally {
      setUploadProgress(0);
      setImageProgress({ loaded: 0, total: 0 });
      setDocumentProgress({ loaded: 0, total: 0 });
    }
  };
  if (loading) return <Loading />;
  if (uploadProgress) return <Loading progress={uploadProgress} />;
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
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl relative z-10 justify-center">
        <div className="p-4 md:p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="p-0 border-0 bg-transparent"
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
                {t('partnerRequest.partnerRegistration.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('partnerRequest.partnerRegistration.subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/PartnerTypeSelection')}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              <i className="fas fa-briefcase" />
              <span className="text-sm font-medium">
                {partnerTypeFromUrl
                  ? t(`Enums.PartnerType.${partnerTypeFromUrl}`)
                  : t('partnerRequest.partnerRegistration.notSelectedType')}
              </span>
              <i className="fas fa-edit ml-1 opacity-75" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                placeholder=" "
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <label
                htmlFor="companyName"
                className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                {t('partnerRequest.partnerRegistration.form_companyName')}
                <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  {t('partnerRequest.partnerRegistration.form_email')}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                  placeholder=" "
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <label
                  htmlFor="phoneNumber"
                  className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  {t('partnerRequest.partnerRegistration.form_phoneNumber')}
                  <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                type="text"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                placeholder=" "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label
                htmlFor="description"
                className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                {t('partnerRequest.partnerRegistration.form_description')}
              </label>
            </div>
            {/* Upload ảnh */}
            {/* Images Upload Section */}
            <div className="space-y-3">
              {' '}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-images text-orange-500 mr-2"></i>
                  {t('partnerRequest.partnerRegistration.form_images')}
                </label>
                {/* Display Image Count */}
                <span className="text-xs text-gray-500">
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>
              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  aria-label={t('upload.uploadImages')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                    <i className="fas fa-cloud-upload-alt text-orange-500 text-xl"></i>
                  </div>
                  <p className="text-gray-600 text-center mb-2">
                    <span className="font-semibold text-orange-600">
                      {t('upload.clickToUploadImage')}
                    </span>{' '}
                    {t('upload.orDragAndDrop')}
                  </p>
                  <p className="text-sm text-gray-400">
                    {i18n.language === 'vi'
                      ? 'PNG, JPG, GIF tối đa 5MB mỗi file'
                      : 'PNG, JPG, GIF up to 5MB each'}
                  </p>
                </div>
              </div>
              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.url}
                      className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
                    >
                      <img
                        src={img.url}
                        alt={img.name || `Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          aria-label={t('upload.removeImage')}
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>{' '}
            {/* Upload Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-file-alt text-blue-500 mr-2"></i>
                  {t('partnerRequest.partnerRegistration.form_documents')}
                </label>
                <span className="text-xs text-gray-500">
                  {documents.length}/{MAX_DOCUMENTS}
                </span>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept={ACCEPTED_DOC_TYPES}
                  multiple
                  onChange={handleDocumentChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload documents"
                />
                <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <i className="fas fa-cloud-upload-alt text-blue-500 text-xl"></i>
                  </div>
                  <p className="text-gray-600 text-center mb-2">
                    <span className="font-semibold text-blue-600">
                      {t('upload.clickToUploadDocument')}
                    </span>{' '}
                    {t('upload.orDragAndDrop')}
                  </p>
                </div>
              </div>
              {documents.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.url}
                      className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-gray-50 flex flex-col items-center justify-center p-2 text-center"
                    >
                      {/* Đổi màu hover */}
                      <i
                        className={`${getDocumentIcon(doc.name)} text-4xl mb-2`}
                      ></i>
                      <p className="text-xs text-gray-600 break-all truncate px-2">
                        {doc.name}
                      </p>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          aria-label="Remove document"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
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
                {t('BUTTON.Back')}
              </button>

              <button
                type="submit"
                disabled={documents.length === 0 || images.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <i className="fas fa-paper-plane mr-2" />
                {t('BUTTON.RegisterPartner')}
              </button>
            </div>
            {/* Note */}
            <div
              role="note"
              className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-xs flex items-start"
            >
              <i
                className="fas fa-info-circle mr-2 mt-0.5 text-blue-600"
                aria-hidden="true"
              />
              {t('partnerRequest.partnerRegistration.process_infor')}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

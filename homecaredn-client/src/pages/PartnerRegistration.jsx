import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { partnerRequestService } from '../services/partnerRequestService';
import { isSafeEmail } from '../utils/validateEmail';
import { isSafePhone } from '../utils/validatePhone';
import Loading from '../components/Loading';
import { handleApiError } from '../utils/handleApiError';
import { eKycService } from '../services/eKycService';
import * as FFmpeg from '@ffmpeg/ffmpeg';

const MAX_IMAGES = 5;
const MAX_DOCUMENTS = 5;
const ACCEPTED_DOC_TYPES = '.pdf,.doc,.docx,.txt';

export default function PartnerRegistration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerTypeFromUrl = searchParams.get('partnerRequestType');

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
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
  const { createFFmpeg, fetchFile } = FFmpeg;

  const ffmpeg = createFFmpeg({ log: true });
  const [cccdImage, setCccdImage] = useState(null);
  const [faceVideo, setFaceVideo] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [faceVideoUrl, setFaceVideoUrl] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEkycVerified, setIsEkycVerified] = useState(false);

  useEffect(() => {
    setPartnerRequestType(partnerTypeFromUrl);
    setCompanyName('');
    setEmail('');
    setPhoneNumber('');
    setDescription('');
    setImages([]);
    setDocuments([]);
    setUploadProgress(0);
    setImageProgress({ loaded: 0, total: 0 });
    setDocumentProgress({ loaded: 0, total: 0 });
    setCurrentStep(1);
  }, [partnerTypeFromUrl]);

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

  const handleRemoveImage = (img) =>
    setImages((prev) => prev.filter((i) => i.url !== img.url));

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

  const handleRemoveDocument = (doc) =>
    setDocuments((prev) => prev.filter((d) => d.url !== doc.url));

  const getDocumentIcon = (fileName) => {
    if (!fileName) return 'fas fa-file text-gray-400';
    if (fileName.endsWith('.pdf')) return 'fas fa-file-pdf text-red-500';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx'))
      return 'fas fa-file-word text-blue-500';
    if (fileName.endsWith('.txt')) return 'fas fa-file-alt text-gray-500';
    return 'fas fa-file text-gray-400';
  };

  const validateForm = () => {
    if (!partnerRequestType) {
      toast.error(t('ERROR.NULL_PARTNERTYPE'));
      return false;
    }
    if (!email) {
      toast.error(t('ERROR.NULL_EMAIL'));
      return false;
    }
    if (!isSafeEmail(email)) {
      toast.error(t('ERROR.INVALID_EMAIL'));
      return false;
    }
    if (!companyName) {
      toast.error(t('ERROR.NULL_COMPANYNAME'));
      return false;
    }
    if (!phoneNumber) {
      toast.error(t('ERROR.NULL_PHONE'));
      return false;
    }
    if (!isSafePhone(phoneNumber)) {
      toast.error(t('ERROR.INVALID_PHONE'));
      return false;
    }
    if (images.length > MAX_IMAGES) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return false;
    }
    if (documents.length > MAX_DOCUMENTS) {
      toast.error(t('ERROR.MAXIMUM_DOCUMENT'));
      return false;
    }
    return true;
  };

  const handleFileUploads = async () => {
    const newImageFiles = images
      .filter((img) => img.file)
      .map((img) => img.file);
    const newDocumentFiles = documents
      .filter((doc) => doc.file)
      .map((doc) => doc.file);

    if (newImageFiles.length === 0 && newDocumentFiles.length === 0) {
      return { imageResults: null, documentResults: null };
    }

    setImageProgress({
      loaded: 0,
      total: newImageFiles.reduce((sum, f) => sum + f.size, 0),
    });
    setDocumentProgress({
      loaded: 0,
      total: newDocumentFiles.reduce((sum, f) => sum + f.size, 0),
    });
    setUploadProgress(1);

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
    return { imageResults, documentResults };
  };

  const formatUploadResults = (results) => {
    if (!results) return { urls: [], publicIds: [] };
    const arr = Array.isArray(results) ? results : [results];
    return {
      urls: arr.map((u) => u.url),
      publicIds: arr.map((u) => u.publicId),
    };
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });

    videoRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const webmFile = new File([webmBlob], 'face-video.webm', { type: 'video/webm' });

      // Convert WebM -> MP4
      if (!ffmpeg.isLoaded()) await ffmpeg.load();

      ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmFile));
      await ffmpeg.run('-i', 'input.webm', '-c:v', 'libx264', '-preset', 'fast', 'output.mp4');

      const mp4Data = ffmpeg.FS('readFile', 'output.mp4');
      const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
      const mp4File = new File([mp4Blob], 'face-video.mp4', { type: 'video/mp4' });

      const url = URL.createObjectURL(mp4File);
      setFaceVideo(mp4File);
      setFaceVideoUrl(url);

      closeModal();
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordTime(0);

    timerRef.current = setInterval(() => {
      setRecordTime((t) => {
        if (t >= 15) {
          stopRecording();
          return t;
        }
        return t + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recordTime < 10) {
      toast.error('Video phải dài ít nhất 10 giây');
      return;
    }

    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const closeModal = () => {
    if (isRecording) return;

    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((t) => t.stop());

    setShowModal(false);
  };
  const handleRemoveFaceVideo = () => {
    if (faceVideoUrl) {
      URL.revokeObjectURL(faceVideoUrl);
    }
    setFaceVideo(null);
    setFaceVideoUrl(null);
    setIsEkycVerified(false);
  };

  const handleCccdChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('CCCD phải là hình ảnh');
      return;
    }
    setIsEkycVerified(false);
    setCccdImage(file);
  };

  const handleVerify = async () => {
    if (!cccdImage || !faceVideo) {
      toast.error('Vui lòng tải CCCD và quay video khuôn mặt');
      return;
    }
    const formData = new FormData();
    formData.append('CccdImage', cccdImage);
    formData.append('FaceVideo', faceVideo);
    console.log("formData", formData);
    try {
      setIsVerifying(true);
      await eKycService.verify(formData);
      setIsEkycVerified(true);
      toast.success(t('SUCCESS.EKYC_SUCCESS'));
    } catch (err) {
      toast.error(t(handleApiError(err)));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!cccdImage || !faceVideo) {
      toast.error('Vui lòng xác minh CCCD và khuôn mặt');
      return;
    }
    setLoading(true);
    try {
      await partnerRequestService.sendOtp({ email, companyName });
      toast.success(
        `${t(
          'partnerRequest.partnerRegistration.notification.otpSent'
        )} ${email}`
      );
      setCurrentStep(2);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length < 6) {
      toast.warning(
        t('partnerRequest.partnerRegistration.validation.otpInvalid')
      );
      return;
    }

    setLoading(true);
    try {
      const response = await partnerRequestService.verifyOtp({ email, otpCode });
      const token = typeof response === 'string' ? response : response?.token;

      if (!token) {
        toast.error(
          t('partnerRequest.partnerRegistration.validation.otpError')
        );
        return;
      }

      const { imageResults, documentResults } = await handleFileUploads();
      const { urls: ImageUrls, publicIds: ImagePublicIds } =
        formatUploadResults(imageResults);
      const { urls: DocumentUrls, publicIds: DocumentPublicIds } =
        formatUploadResults(documentResults);

      const payload = {
        PartnerRequestType: partnerRequestType,
        CompanyName: companyName,
        Email: email,
        PhoneNumber: phoneNumber,
        Description: description,
        VerificationToken: token,
        ImageUrls,
        ImagePublicIds,
        DocumentUrls,
        DocumentPublicIds,
      };

      await partnerRequestService.create(payload);

      toast.success(t('SUCCESS.PARTNER_REQUEST_ADD'));
      navigate('/Login');
    } catch (error) {
      toast.error(t(handleApiError(error)));
    } finally {
      setLoading(false);
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
          {/* Logo & Header */}
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
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {t('partnerRequest.partnerRegistration.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentStep === 1 &&
                  t('partnerRequest.partnerRegistration.subtitle')}
                {currentStep === 2 &&
                  t('partnerRequest.partnerRegistration.step2.title')}
              </p>
            </div>
            {/* Step Indicator */}
            <div className="shrink-0 inline-flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[1, 2].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  ></div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  currentStep === 1 && navigate('/PartnerTypeSelection')
                }
                disabled={currentStep !== 1}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-default"
              >
                <i className="fas fa-briefcase" />
                <span className="text-sm font-medium">
                  {partnerTypeFromUrl
                    ? t(`Enums.PartnerType.${partnerTypeFromUrl}`)
                    : t('partnerRequest.partnerRegistration.notSelectedType')}
                </span>
                {currentStep === 1 && (
                  <i className="fas fa-edit ml-1 opacity-75" />
                )}
              </button>
            </div>
          </div>

          {/* --- STEP 1: INFO --- */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
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

              {/* ===== EKYC: CCCD ===== */}
              <div div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-id-card text-green-600 mr-2"></i>
                  Xác minh CCCD <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCccdChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />

                {cccdImage && (
                  <img
                    src={URL.createObjectURL(cccdImage)}
                    alt="CCCD Preview"
                    className="mt-2 w-64 border rounded-lg"
                  />
                )}
              </div>

              {/* ===== QUAY VIDEO WEBCAM ===== */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="fas fa-video mr-2 text-purple-600"></i>
                  Quay video khuôn mặt <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="flex gap-3">
                  {!isRecording && !faceVideo && (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      disabled={!cccdImage}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer"
                    >
                      Quay video khuôn mặt
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Video từ 10–15 giây, nhìn thẳng camera, đủ sáng
                </p>
              </div>
              {faceVideo && (
                <div className="relative mt-2 w-64">
                  <video
                    src={faceVideoUrl}
                    controls
                    className="w-full rounded-lg border"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveFaceVideo}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700"
                    title="Xoá video"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || isEkycVerified}
                className={`w-full py-3 rounded-lg mt-6 flex items-center justify-center gap-2 text-white
                  ${isEkycVerified
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isVerifying
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  }
                `}
              >
                {isEkycVerified ? (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Đã xác minh eKYC
                  </>
                ) : isVerifying ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    {t('common.loadingData', { defaultValue: 'Đang kiểm tra...' })}
                  </>
                ) : (
                  'Kiểm tra eKYC'
                )}
              </button>

              {showModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center">
                  <div className=" rounded-xl p-6 w-96 relative flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">
                      Xác minh khuôn mặt
                    </h3>

                    {/* Oval frame */}
                    <div className="w-64 h-80 rounded-full overflow-hidden flex items-center justify-center bg-gray-900">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      Thời gian: {recordTime}s (10–15s)
                    </p>

                    <div className="flex gap-3 mt-4 w-full">
                      {!isRecording && (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg cursor-pointer"
                        >
                          Bắt đầu
                        </button>
                      )}

                      {isRecording && recordTime >= 10 && (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg cursor-pointer"
                        >
                          Dừng
                        </button>
                      )}
                      {!isRecording && (
                        <button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg cursor-pointer"
                        >
                          Huỷ
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* Images Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <i className="fas fa-images text-orange-500 mr-2"></i>
                    {t('partnerRequest.partnerRegistration.form_images')}
                  </label>
                  <span className="text-xs text-gray-500">
                    {images.length}/{MAX_IMAGES}
                  </span>
                </div>
                {images.length < MAX_IMAGES && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                        <i className="fas fa-cloud-upload-alt text-orange-500 text-xl"></i>
                      </div>
                      <p className="text-gray-600 text-center mb-2">
                        <span className="font-semibold text-orange-600">
                          {t('upload.clickToUploadImage')}
                        </span>
                        {t('upload.orDragAndDrop')}
                      </p>
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.url}
                        className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
                      >
                        <img
                          src={img.url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          >
                            <i className="fas fa-trash-alt text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents Upload */}
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
                {documents.length < MAX_DOCUMENTS && (
                  <div className="relative">
                    <input
                      type="file"
                      accept={ACCEPTED_DOC_TYPES}
                      multiple
                      onChange={handleDocumentChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <i className="fas fa-cloud-upload-alt text-blue-500 text-xl"></i>
                      </div>
                      <p className="text-gray-600 text-center mb-2">
                        <span className="font-semibold text-blue-600">
                          {t('upload.clickToUploadDocument')}
                        </span>
                        {t('upload.orDragAndDrop')}
                      </p>
                    </div>
                  </div>
                )}
                {documents.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.url}
                        className="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-gray-50 flex flex-col items-center justify-center p-2 text-center"
                      >
                        <i
                          className={`${getDocumentIcon(
                            doc.name
                          )} text-4xl mb-2`}
                        ></i>
                        <p className="text-xs text-gray-600 break-all truncate px-2">
                          {doc.name}
                        </p>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
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
                  <i className="fas fa-arrow-left mr-2" /> {t('BUTTON.Back')}
                </button>
                <button
                  disabled={!isEkycVerified}
                  type="submit"
                  className="flex-1 bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {t('BUTTON.Continue')} &nbsp;
                  <i className="fas fa-arrow-right" />
                </button>
              </div>
            </form>
          )}

          {/* --- STEP 2: OTP --- */}
          {currentStep === 2 && (
            <div className="space-y-6 text-center py-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-gray-700">
                  {t('partnerRequest.partnerRegistration.step2.otpSent')}
                  <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('partnerRequest.partnerRegistration.step2.checkSpam')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('partnerRequest.partnerRegistration.step2.enterOtp')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replaceAll(/\D/g, ''))
                  }
                  className="block w-full text-center text-3xl tracking-[0.5em] font-bold text-blue-600 border-2 border-gray-300 rounded-lg p-4 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t(
                    'partnerRequest.partnerRegistration.step2.otpPlaceholder'
                  )}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50"
                >
                  <i className="fas fa-arrow-left mr-2" />
                  {t('partnerRequest.partnerRegistration.step2.backButton')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={otpCode.length < 6}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {t('partnerRequest.partnerRegistration.step2.verifyButton')}
                  <i className="fas fa-check ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Note */}
          <div
            role="note"
            className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-800 text-xs flex items-start"
          >
            <i
              className="fas fa-info-circle mr-2 mt-0.5 text-blue-600"
              aria-hidden="true"
            />
            {t('partnerRequest.partnerRegistration.process_infor')}
          </div>
        </div>
      </div>
    </div >
  );
}

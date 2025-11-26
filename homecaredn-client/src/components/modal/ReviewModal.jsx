import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hook/useAuth';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';

export default function ReviewModal({
  isOpen,
  onClose,
  onSave,
  review,
  serviceRequestID,
  materialRequestID,
  partnerID,
  setUploadProgress,
  readOnly,
}) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (review) {
        setRating(review.rating || 0);
        setComment(review.comment || '');
        setImages(review.imageUrls || []);
      } else {
        setRating(0);
        setComment('');
        setImages([]);
      }
      setUploadProgress(0);
    }
  }, [isOpen, review, setUploadProgress]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error(t('ERROR.MAXIMUM_IMAGE'));
      return;
    }
    const mappedFiles = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
    }));
    setImages((prev) => [...prev, ...mappedFiles]);
  };

  const handleRemoveImage = (img) => {
    setImages((prev) => prev.filter((i) => i.url !== img.url));
  };

  const handleSubmit = async () => {
    if (readOnly) {
      onClose();
      return;
    }
    if (rating === 0) {
      toast.error(t('ERROR.REQUIRED_RATING'));
      return;
    }
    try {
      const newFiles = images.map((i) => i.file).filter(Boolean);
      const data = {
        UserID: user?.id || null,
        ServiceRequestID: serviceRequestID || null,
        MaterialRequestID: materialRequestID || null,
        PartnerID: partnerID || null,
        Rating: rating,
        Comment: comment || null,
      };
      if (newFiles.length > 0) {
        setUploadProgress(1);
        const uploaded = await uploadToCloudinary(
          newFiles,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          (percent) => setUploadProgress(percent),
          'HomeCareDN/Review'
        );
        const uploadedArray = Array.isArray(uploaded) ? uploaded : [uploaded];
        data.ImageUrls = uploadedArray.map((u) => u.url);
        data.ImagePublicIds = uploadedArray.map((u) => u.publicId);
      }
      await onSave(data);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">
            <i className="fas fa-star text-yellow-500 mr-2"></i>
            {readOnly
              ? t('ModalPopup.ReviewModal.view')
              : t('ModalPopup.ReviewModal.create')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors duration-200 rounded-full hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="text-lg fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 pr-2 mt-6 space-y-6 overflow-y-auto">
          {/* Rating */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              {t('ModalPopup.ReviewModal.rating')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div
              role="radiogroup"
              aria-label="Rating"
              className="flex items-center gap-2"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="cursor-pointer text-4xl transition-all duration-200 bg-transparent border-none p-0"
                  aria-label={`${star} ${t(
                    'ModalPopup.ReviewModal.ratingStar'
                  )}`}
                  disabled={readOnly}
                  onMouseEnter={() => !readOnly && setHoveredRating(star)}
                  onMouseLeave={() => !readOnly && setHoveredRating(0)}
                  onClick={() => !readOnly && setRating(star)}
                  onKeyDown={(e) => {
                    if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setRating(star);
                    }
                  }}
                >
                  <i
                    className={
                      star <= (hoveredRating || rating)
                        ? 'fas fa-star text-yellow-400'
                        : 'far fa-star text-gray-300'
                    }
                  ></i>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          {!readOnly && (
            <div>
              <label
                htmlFor="review-comment"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t('ModalPopup.ReviewModal.comment')}
              </label>
              <textarea
                id="review-comment"
                disabled={readOnly}
                className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                rows="5"
                placeholder={t('ModalPopup.ReviewModal.commentPlaceholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}

          {readOnly && review?.comment && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('ModalPopup.ReviewModal.comment')}
              </label>
              <p className="px-4 py-3 border rounded-xl bg-gray-50 text-gray-700">
                {review.comment}
              </p>
            </div>
          )}

          {/* Images */}
          {!readOnly && (
            <div>
              <label
                htmlFor="review-upload"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t('ModalPopup.ReviewModal.images')}
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
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {images.length < 5 && (
                <div className="mt-3">
                  <label
                    htmlFor="review-upload"
                    className="inline-block px-4 py-2 border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-blue-400 hover:bg-blue-50"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {t('ModalPopup.ReviewModal.uploadImages')}
                  </label>
                  <input
                    id="review-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <span className="ml-3 text-sm text-gray-500">
                    ({images.length}/5)
                  </span>
                </div>
              )}
            </div>
          )}

          {readOnly && review?.imageUrls?.length > 0 && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t('ModalPopup.ReviewModal.images')}
              </label>
              <div className="flex flex-wrap gap-3">
                {review.imageUrls.map((url) => (
                  <div
                    key={url}
                    className="relative overflow-hidden border w-28 h-28 rounded-xl"
                  >
                    <img
                      src={url}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Info */}
          {readOnly && review && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fas fa-calendar-alt"></i>
                <span>{formatDate(review.createdAt, i18n.language)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Warning */}
        {!readOnly && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-700">
            <i className="fa-solid fa-triangle-exclamation text-red-500 text-lg"></i>
            <p>{t('ModalPopup.ReviewModal.warning')}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 pt-4 mt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {readOnly ? t('BUTTON.Close') : t('BUTTON.Cancel')}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0}
              className="px-6 py-2 font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              {t('BUTTON.Send')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  review: PropTypes.object,
  serviceRequestID: PropTypes.string,
  materialRequestID: PropTypes.string,
  partnerID: PropTypes.string,
  setUploadProgress: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

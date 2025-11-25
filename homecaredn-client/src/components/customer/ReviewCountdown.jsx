import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function ReviewCountdown({
  request,
  onCreateReview,
  onViewReview,
}) {
  const { t } = useTranslation();

  const getCountdown = () => {
    if (!request.startReviewDate) return null;

    const now = new Date();
    const reviewDate = new Date(request.startReviewDate);
    const diff = reviewDate - now;

    if (diff <= 0) return { expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  };

  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    if (!request.startReviewDate || request.review) return;

    const timer = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  // Ẩn nếu status khác Closed
  if (request.status !== 'Closed') return null;

  // Hiển thị nút View nếu đã review
  if (request.review) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            <span className="text-sm font-medium text-gray-700">
              {t('ReviewCountdown.reviewed')}
            </span>
            <div className="flex items-center gap-1 ml-2">
              {Array.from({ length: 5 }, (_, i) => {
                const key = `star-${request?.id || 'sr'}-${i}`;
                return (
                  <i
                    key={key}
                    className={`fas fa-star text-sm ${
                      i < request.review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  ></i>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onViewReview(request)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <i className="fas fa-eye mr-2"></i>
            {t('ReviewCountdown.viewReview')}
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị nút Create nếu countdown expired hoặc chưa startReviewDate
  if (!countdown || countdown.expired) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-orange-500">
            <i className="fas fa-clock"></i>
            <span className="text-sm font-medium">
              {t('ReviewCountdown.reviewTimeExpired')}
            </span>
          </div>
          <button
            onClick={() => onCreateReview(request)}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-md"
          >
            <i className="fas fa-star mr-2"></i>
            {t('ReviewCountdown.createReview')}
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị countdown timer
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-blue-600">
          <i className="fas fa-hourglass-half"></i>
          <span className="text-sm font-medium">
            {t('ReviewCountdown.reviewAvailableIn')}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {countdown.days > 0 && (
            <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-lg min-w-[60px]">
              <span className="text-lg font-bold text-blue-600">
                {countdown.days}
              </span>
              <span className="text-xs text-blue-500">
                {t('ReviewCountdown.days')}
              </span>
            </div>
          )}
          <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-lg min-w-[60px]">
            <span className="text-lg font-bold text-blue-600">
              {countdown.hours}
            </span>
            <span className="text-xs text-blue-500">
              {t('ReviewCountdown.hours')}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-lg min-w-[60px]">
            <span className="text-lg font-bold text-blue-600">
              {countdown.minutes}
            </span>
            <span className="text-xs text-blue-500">
              {t('ReviewCountdown.minutes')}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-lg min-w-[60px]">
            <span className="text-lg font-bold text-blue-600">
              {countdown.seconds}
            </span>
            <span className="text-xs text-blue-500">
              {t('ReviewCountdown.seconds')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

ReviewCountdown.propTypes = {
  serviceRequest: PropTypes.object.isRequired,
  onCreateReview: PropTypes.func.isRequired,
  onViewReview: PropTypes.func.isRequired,
};

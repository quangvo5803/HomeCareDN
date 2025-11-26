import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function ReviewCountdown({
  request,
  application,
  onCreateReview,
  onViewReview,
}) {
  const { t } = useTranslation();

  const getCountdown = () => {
    if (!request.startReviewDate) return null;

    const now = new Date();
    const reviewDate = new Date(request.startReviewDate);
    const diff = reviewDate - now;

    // Đã đến lúc review → expired = true
    if (diff <= 0) return { expired: true };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    if (!request.startReviewDate || request.review) return;

    const timer = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.startReviewDate, request.review]);

  if (application.status !== 'Approved') return null;

  // ⭐ Nếu đã review → hiện block View
  if (request.review) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            <span className="text-sm font-medium text-gray-700">
              {t('ReviewCountdown.reviewed')}
            </span>
            {/* Rating */}
            <div className="flex items-center gap-1 ml-2">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={`star-${request?.id}-${i}`}
                  className={`fas fa-star text-sm ${
                    i < request.review.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                ></i>
              ))}
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

  // ⭐ Nếu đã đến ngày (expired) → hiện nút Tạo Review
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

  // ⭐ Chưa đến ngày → HIỆN COUNTDOWN
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-blue-600">
          <i className="fas fa-hourglass-half"></i>
          <span className="text-sm font-medium">
            {t('ReviewCountdown.reviewAvailableIn')}
          </span>
        </div>

        {/* Countdown UI */}
        <div className="flex items-center gap-2 flex-wrap">
          {countdown.days > 0 && (
            <TimeBox label={t('ReviewCountdown.days')} value={countdown.days} />
          )}

          <TimeBox label={t('ReviewCountdown.hours')} value={countdown.hours} />
          <TimeBox
            label={t('ReviewCountdown.minutes')}
            value={countdown.minutes}
          />
          <TimeBox
            label={t('ReviewCountdown.seconds')}
            value={countdown.seconds}
          />
        </div>
      </div>
    </div>
  );
}

function TimeBox({ label, value }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-lg min-w-[60px]">
      <span className="text-lg font-bold text-blue-600">{value}</span>
      <span className="text-xs text-blue-500">{label}</span>
    </div>
  );
}

ReviewCountdown.propTypes = {
  request: PropTypes.object.isRequired,
  application: PropTypes.object.isRequired,
  onCreateReview: PropTypes.func.isRequired,
  onViewReview: PropTypes.func.isRequired,
};

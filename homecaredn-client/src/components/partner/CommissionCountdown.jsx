import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';

export default function CommissionCountdown({ dueCommisionTime, onExpired }) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!dueCommisionTime) return;

    const dueDate = new Date(dueCommisionTime);
    if (isNaN(dueDate.getTime())) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = dueDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft(null);
        if (onExpired) onExpired();
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, total: difference };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueCommisionTime, onExpired]);

  if (!timeLeft) {
    return (
      <div className="bg-red-50 rounded-lg p-4 ring-2 ring-red-200">
        <div className="flex items-center gap-3">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          <div>
            <p className="font-bold text-red-700">
              {t('commission.expiredTitle')}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {t('commission.expiredMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000;
  const isCritical = timeLeft.total < 6 * 60 * 60 * 1000;

  const bgColor = isCritical
    ? 'bg-red-50'
    : isUrgent
    ? 'bg-orange-50'
    : 'bg-yellow-50';
  const ringColor = isCritical
    ? 'ring-red-300'
    : isUrgent
    ? 'ring-orange-300'
    : 'ring-yellow-300';
  const textColor = isCritical
    ? 'text-red-700'
    : isUrgent
    ? 'text-orange-700'
    : 'text-yellow-700';
  const iconColor = isCritical
    ? 'text-red-500'
    : isUrgent
    ? 'text-orange-500'
    : 'text-yellow-500';

  return (
    <div className={`${bgColor} rounded-lg p-4 ring-2 ${ringColor}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <i className={`fas fa-clock ${iconColor} text-2xl`}></i>
        </div>
        <div className="flex-1">
          <p className={`font-bold ${textColor} mb-2`}>
            {isCritical
              ? `🚨 ${t('commission.urgent')}`
              : isUrgent
              ? `⚠️ ${t('commission.less24h')}`
              : `⏰ ${t('commission.deadline')}`}
          </p>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center bg-white rounded-lg p-2 shadow-sm">
              <div className={`text-2xl font-bold ${textColor}`}>
                {timeLeft.days}
              </div>
              <div className="text-xs text-gray-600 uppercase">
                {t('commission.days')}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-2 shadow-sm">
              <div className={`text-2xl font-bold ${textColor}`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 uppercase">
                {t('commission.hours')}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-2 shadow-sm">
              <div className={`text-2xl font-bold ${textColor}`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 uppercase">
                {t('commission.minutes')}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-2 shadow-sm">
              <div className={`text-2xl font-bold ${textColor}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 uppercase">
                {t('commission.seconds')}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {isCritical ? (
              <span className="font-semibold text-red-600">
                {t('commission.completeNow')}
              </span>
            ) : isUrgent ? (
              <span className="font-semibold text-orange-600">
                {t('commission.under24h')}
              </span>
            ) : (
              <span>{t('commission.payBeforeDeadline')}</span>
            )}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            <i className="far fa-calendar mr-1"></i>
            {t('commission.due')}: {formatDate(dueCommisionTime, i18n.language)}
          </p>
        </div>
      </div>
    </div>
  );
}

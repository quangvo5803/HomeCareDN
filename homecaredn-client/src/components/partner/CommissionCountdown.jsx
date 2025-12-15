import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatters';

const HOURS_6_IN_MS = 6 * 60 * 60 * 1000;
const HOURS_24_IN_MS = 24 * 60 * 60 * 1000;

export default function CommissionCountdown({
  dueCommisionTime,
  onExpired,
  role = 'partner',
}) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(null);

  // Dùng useRef để lưu onExpired mới nhất mà không gây re-render cho useEffect chính
  const onExpiredRef = useRef(onExpired);
  const isExpiredCalled = useRef(false);

  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  useEffect(() => {
    if (!dueCommisionTime) return;

    isExpiredCalled.current = false;

    const calculateTimeLeft = () => {
      // FIX: Sửa new Date.now() thành Date.now()
      const now = Date.now();
      const dueTime = new Date(dueCommisionTime).getTime();
      const total = dueTime - now;

      if (total <= 0) {
        setTimeLeft(null);

        if (!isExpiredCalled.current) {
          isExpiredCalled.current = true;
          if (onExpiredRef.current) {
            onExpiredRef.current();
          }
        }
        return true; // Should stop
      }

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const seconds = Math.floor((total / 1000) % 60);

      setTimeLeft({ total, days, hours, minutes, seconds });
      return false; // Should not stop
    };

    const initialExpired = calculateTimeLeft();
    if (initialExpired) return;

    const timer = setInterval(() => {
      const shouldStop = calculateTimeLeft();
      if (shouldStop) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dueCommisionTime]);

  const prefix = `commission.${role}`;

  const status = useMemo(() => {
    if (!timeLeft) return 'expired';
    if (timeLeft.total < HOURS_6_IN_MS) return 'critical';
    if (timeLeft.total < HOURS_24_IN_MS) return 'urgent';
    return 'normal';
  }, [timeLeft]);

  const styles = {
    expired: {
      bg: 'bg-red-50',
      ring: 'ring-red-200',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
    critical: {
      bg: 'bg-red-50',
      ring: 'ring-red-300',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
    urgent: {
      bg: 'bg-orange-50',
      ring: 'ring-orange-300',
      icon: 'text-orange-500',
      text: 'text-orange-700',
    },
    normal: {
      bg: 'bg-yellow-50',
      ring: 'ring-yellow-300',
      icon: 'text-yellow-500',
      text: 'text-yellow-700',
    },
  }[status];

  if (!timeLeft) {
    return (
      <div className={`${styles.bg} rounded-lg p-4 ring-2 ${styles.ring}`}>
        <div className="flex items-center gap-3">
          <i
            className={`fas fa-exclamation-triangle ${styles.icon} text-2xl`}
            aria-hidden="true"
          />
          <div>
            <p className={`font-bold ${styles.text}`}>
              {t(`${prefix}.expiredTitle`)}
            </p>
            <p className="text-sm text-gray-600">
              {t(`${prefix}.expiredMessage`)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const titleMap = {
    critical: `🚨 ${t(`${prefix}.urgent`)}`,
    urgent: `⚠️ ${t(`${prefix}.less24h`)}`,
    normal: `⏰ ${t(`${prefix}.deadline`)}`,
  };

  const noteMap = {
    critical: (
      <span className="font-semibold text-red-600">
        {t(`${prefix}.completeNow`)}
      </span>
    ),
    urgent: (
      <span className="font-semibold text-orange-600">
        {t(`${prefix}.under24h`)}
      </span>
    ),
    normal: <span>{t(`${prefix}.payBeforeDeadline`)}</span>,
  };

  return (
    <div className={`${styles.bg} rounded-lg p-4 ring-2 ${styles.ring}`}>
      <div className="flex items-start gap-3">
        <i
          className={`fas fa-clock ${styles.icon} text-2xl`}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className={`font-bold ${styles.text} mb-2`}>{titleMap[status]}</p>

          {/* Countdown Grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
              <div
                key={unit}
                className="flex flex-col items-center bg-white rounded p-2 shadow-sm"
              >
                <span className="font-bold text-lg text-gray-700">
                  {timeLeft[unit]}
                </span>
                <span className="text-xs text-gray-500">
                  {t(`commission.${unit}`)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600">{noteMap[status]}</p>
          <p className="text-xs text-gray-500 mt-2">
            <i className="far fa-calendar mr-1" aria-hidden="true" />
            {t('commission.due')}: {formatDate(dueCommisionTime, i18n.language)}
          </p>
        </div>
      </div>
    </div>
  );
}

CommissionCountdown.propTypes = {
  dueCommisionTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  onExpired: PropTypes.func,
  role: PropTypes.string,
};

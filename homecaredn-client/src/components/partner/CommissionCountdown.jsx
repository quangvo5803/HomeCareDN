import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';
import PropTypes from 'prop-types';

export default function CommissionCountdown({
  dueCommisionTime,
  onExpired,
  role = 'partner',
}) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!dueCommisionTime) return;

    const calculateTimeLeft = () => {
      const total = new Date(dueCommisionTime) - new Date().getTime();
      if (total <= 0) {
        setTimeLeft(null);
        onExpired?.();
        return;
      }
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const seconds = Math.floor((total / 1000) % 60);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      setTimeLeft({ total, days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dueCommisionTime, onExpired]);

  const prefix = `commission.${role}`;

  const status = useMemo(() => {
    if (!timeLeft) return 'expired';
    if (timeLeft.total < 6 * 60 * 60 * 1000) return 'critical';
    if (timeLeft.total < 24 * 60 * 60 * 1000) return 'urgent';
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
    critical: '🚨 ' + t(prefix + '.urgent'),
    urgent: '⚠️ ' + t(prefix + '.less24h'),
    normal: '⏰ ' + t(prefix + '.deadline'),
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
        <i className={`fas fa-clock ${styles.icon} text-2xl`} />
        <div className="flex-1">
          <p className={`font-bold ${styles.text} mb-2`}>{titleMap[status]}</p>
          {/* Countdown */}
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
                  {t(`time.${unit}`)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">{noteMap[status]}</p>
          <p className="text-xs text-gray-500 mt-2">
            <i className="far fa-calendar mr-1" />
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

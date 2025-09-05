import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function BellIcon() {
  return <i className="fa-solid fa-bell"></i>;
}

export default function NotificationBell({ total }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 grid place-items-center rounded-full border hover:bg-gray-50"
        title={t('partnerDashboard.notifications')}
      >
        <BellIcon className="w-5 h-5 text-gray-700" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            {total}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg p-2 z-20">
          <div className="text-sm text-gray-700 px-2 py-1">
            {t('partnerDashboard.you_have_notifications', { count: total })}
          </div>
          <div className="max-h-64 overflow-auto">
            {[...Array(Math.max(total, 1))].slice(0, 5).map((_, i) => (
              <div
                key={i}
                className="px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {t('partnerDashboard.notification_item', { number: i + 1 })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  total: PropTypes.number,
};

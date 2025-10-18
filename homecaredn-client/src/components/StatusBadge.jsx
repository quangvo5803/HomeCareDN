import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const normalizedStatus =
    typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : status;
  const map = {
    Pending: {
      text: t('common.Pending'),
      cls: 'bg-yellow-100 text-yellow-700',
    },
    Approved: {
      text: t('common.Approved'),
      cls: 'bg-green-100 text-green-700',
    },
    Process: {
      text: t('common.Processed'),
      cls: 'bg-green-100 text-green-700',
    },
    Rejected: {
      text: t('common.Rejected'),
      cls: 'bg-red-100 text-red-700',
    },
  };
  const cfg = map[normalizedStatus] || {
    text: normalizedStatus,
    cls: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

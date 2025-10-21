import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const normalizedStatus =
    typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : status;
  const map = {
    Draft: {
      text: t('Enums.Status.Draft'),
      cls: 'bg-gray-100 text-gray-700 border border-gray-300',
      icon: 'fa-file-alt',
    },
    Opening: {
      text: t('Enums.Status.Opening'),
      cls: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: 'fa-folder-open',
    },
    Closed: {
      text: t('Enums.Status.Closed'),
      cls: 'bg-gray-200 text-gray-800 border border-gray-400',
      icon: 'fa-lock',
    },
    Pending: {
      text: t('Enums.Status.Pending'),
      cls: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      icon: 'fa-spinner',
    },
    Approved: {
      text: t('Enums.Status.Approved'),
      cls: 'bg-green-100 text-green-700 border border-green-300',
      icon: 'fa-check-circle',
    },
    Processed: {
      text: t('Enums.Status.Processed'),
      cls: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
      icon: 'fa-gear',
    },
    Rejected: {
      text: t('Enums.Status.Rejected'),
      cls: 'bg-red-100 text-red-700 border border-red-300',
      icon: 'fa-circle-xmark',
    },
  };
  const cfg = map[normalizedStatus] || {
    text: normalizedStatus,
    cls: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${cfg.cls}`}>
      <i className={`fas ${cfg.icon} mr-2`} />
      {cfg.text}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

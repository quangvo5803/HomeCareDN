import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status, type }) {
  const { t } = useTranslation();

  // ✅ Giữ nguyên dạng status để match đúng key (ví dụ PendingCommission)
  const normalizedStatus =
    typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : status;

  // ✅ Bản đồ màu sắc và icon theo status
  const styleMap = {
    Draft: {
      cls: 'bg-gray-100 text-gray-700 border border-gray-300',
      icon: 'fa-file-alt',
    },
    Opening: {
      cls: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: 'fa-folder-open',
    },
    Closed: {
      cls: 'bg-gray-200 text-gray-800 border border-gray-400',
      icon: 'fa-lock',
    },
    Pending: {
      cls: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      icon: 'fa-spinner',
    },
    PendingCommission: {
      cls: 'bg-orange-100 text-orange-700 border border-orange-300',
      icon: 'fa-hourglass-half',
    },
    Approved: {
      cls: 'bg-green-100 text-green-700 border border-green-300',
      icon: 'fa-check-circle',
    },
    Processed: {
      cls: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: 'fa-circle-check',
    },
    Rejected: {
      cls: 'bg-red-100 text-red-700 border border-red-300',
      icon: 'fa-circle-xmark',
    },
  };

  const styleCfg = styleMap[normalizedStatus] || {
    cls: 'bg-gray-100 text-gray-700 border border-gray-300',
    icon: 'fa-circle-question',
  };

  const translationPath = {
    Application: `Enums.ApplicationStatus.${normalizedStatus}`,
    Request: `Enums.RequestStatus.${normalizedStatus}`,
    PartnerRequest: `Enums.PartneRequestrStatus.${normalizedStatus}`,
  }[type];

  const translatedText = t(translationPath, { defaultValue: normalizedStatus });

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${styleCfg.cls}`}>
      <i className={`fas ${styleCfg.icon} mr-2`} />
      {translatedText}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'ApplicationStatus',
    'RequestStatus',
    'PartnerRequestStatus',
    'Status',
  ]),
};

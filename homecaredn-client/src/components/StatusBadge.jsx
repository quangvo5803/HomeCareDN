import PropTypes from 'prop-types';

export default function StatusBadge({ status, t }) {
  const map = {
    Pending: {
      text: t('partnerDashboard.pending'),
      cls: 'bg-yellow-100 text-yellow-700',
    },
    Approved: {
      text: t('partnerDashboard.approved'),
      cls: 'bg-green-100 text-green-700',
    },
    Rejected: {
      text: t('partnerDashboard.rejected'),
      cls: 'bg-red-100 text-red-700',
    },
  };
  const cfg = map[status] || { text: status, cls: 'bg-gray-100 text-gray-700' };
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

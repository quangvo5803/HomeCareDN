import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePartner } from '../../hook/usePartner';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';

export default function PartnerModal({ isOpen, onClose, partner }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { approvePartner, rejectPartner } = usePartner();

  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen || !partner) return null;

  // --- Helpers (không dùng hook) ---
  const getTypeLabel = (v) => {
    if (typeof v === 'string') return t(`partner.${v.toLowerCase()}`, v);
    if (v === 0) return t('partner.distributor', 'Distributor');
    if (v === 1) return t('partner.contractor', 'Contractor');
    return String(v ?? '-');
  };

  const getStatusKey = (s) => {
    if (typeof s === 'string') return s.toLowerCase();
    if (s === 0) return 'pending';
    if (s === 1) return 'approved';
    if (s === 2) return 'rejected';
    return 'unknown';
  };

  const getStatusLabel = (s) => t(`partner.status.${getStatusKey(s)}`, s ?? '-');

  const isPending = (s) => getStatusKey(s) === 'pending';

  const safeCreatedAt = (() => {
    try { return partner.createdAt ? formatDate(partner.createdAt, i18n.language) : '-'; }
    catch { return '-'; }
  })();

  // --- Actions ---
  const onApprove = async () => {
    try {
      setBusy(true);
      await approvePartner({
        partnerID: partner.partnerID,
        approvedUserId: user?.userId || user?.id || 'admin',
      });
      toast.success(t('SUCCESS.APPROVE', 'Approved successfully'));
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (!reason.trim()) {
      toast.error(t('adminPartnerManager.modal.rejectionRequired', 'Please provide a rejection reason'));
      return;
    }
    try {
      setBusy(true);
      await rejectPartner({
        partnerID: partner.partnerID,
        rejectionReason: reason.trim(),
      });
      toast.success(t('SUCCESS.REJECT', 'Rejected successfully'));
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] bg-black/40 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t('adminPartnerManager.modal.title', 'Partner details')}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label={t('BUTTON.Close', 'Close')}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label={t('partner.full_name', 'Full name')} value={partner.fullName} />
            <Info label={t('partner.company_name', 'Company')} value={partner.companyName} />
            <Info label="Email" value={partner.email} />
            <Info label={t('partner.phone_number', 'Phone')} value={partner.phoneNumber} />
            <Info label={t('partner.type', 'Type')} value={getTypeLabel(partner.partnerType)} />
            <Info label={t('common.status', 'Status')} value={getStatusLabel(partner.status)} />
            <Info label={t('common.createdAt', 'Created')} value={safeCreatedAt} />
          </div>

          {partner.description && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {t('common.description', 'Description')}
              </div>
              <div className="p-3 border rounded-lg bg-gray-50 text-gray-800">
                {partner.description}
              </div>
            </div>
          )}

          {Array.isArray(partner.imageUrls) && partner.imageUrls.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t('common.images', 'Images')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {partner.imageUrls.map((u, i) => (
                  <img key={`${u}-${i}`} src={u} alt={`partner-img-${i}`} className="w-full h-24 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          )}

          {user?.role === 'Admin' && isPending(partner.status) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminPartnerManager.modal.rejectionReason', 'Rejection reason')}
              </label>
              <textarea
                rows="3"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder={t('adminPartnerManager.modal.rejectionPlaceholder', 'Write reason if rejecting…')}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            {t('BUTTON.Close', 'Close')}
          </button>

          {user?.role === 'Admin' && isPending(partner.status) && (
            <>
              <button
                disabled={busy}
                onClick={onReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {t('BUTTON.Reject', 'Reject')}
              </button>
              <button
                disabled={busy}
                onClick={onApprove}
                className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
              >
                {t('BUTTON.Approve', 'Approve')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900 break-words">{value || '-'}</div>
    </div>
  );
}

Info.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
};

PartnerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  partner: PropTypes.shape({
    partnerID: PropTypes.string,
    fullName: PropTypes.string,
    companyName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    partnerType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    createdAt: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }),
};

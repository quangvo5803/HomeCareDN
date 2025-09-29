import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
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

  // Reset reason when modal closes or partner changes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setBusy(false);
    }
  }, [isOpen]);

  // Prevent memory leaks - cleanup on unmount
  useEffect(() => {
    return () => {
      setReason('');
      setBusy(false);
    };
  }, []);

  // Keyboard event handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Focus trap - focus first focusable element
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, busy, onClose]);

  // Memoized helper functions to prevent unnecessary re-renders
  const getTypeLabel = useCallback((v) => {
    if (typeof v === 'string') return t(`partner.${v.toLowerCase()}`, v);
    if (v === 0) return t('partner.distributor', 'Distributor');
    if (v === 1) return t('partner.contractor', 'Contractor');
    return String(v ?? '-');
  }, [t]);

  const getStatusKey = useCallback((s) => {
    if (typeof s === 'string') return s.toLowerCase();
    if (s === 0) return 'pending';
    if (s === 1) return 'approved';
    if (s === 2) return 'rejected';
    return 'unknown';
  }, []);

  const getStatusLabel = useCallback((s) => t(`partner.status.${getStatusKey(s)}`, s ?? '-'), [t, getStatusKey]);

  const isPending = useCallback((s) => getStatusKey(s) === 'pending', [getStatusKey]);

  const safeCreatedAt = useCallback(() => {
    try {
      return partner?.createdAt ? formatDate(partner.createdAt, i18n.language) : '-';
    } catch {
      return '-';
    }
  }, [partner?.createdAt, i18n.language]);

  // Memoized action handlers
  const handleApprove = useCallback(async () => {
    if (busy) return;

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
  }, [busy, approvePartner, partner?.partnerID, user, t, onClose]);

  const handleReject = useCallback(async () => {
    if (busy || !reason.trim()) {
      if (!reason.trim()) {
        toast.error(t('adminPartnerManager.modal.rejectionRequired', 'Please provide a rejection reason'));
      }
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
  }, [busy, reason, rejectPartner, partner?.partnerID, t, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !busy) {
      onClose();
    }
  }, [busy, onClose]);

  const handleReasonChange = useCallback((e) => {
    setReason(e.target.value);
  }, []);

  if (!isOpen || !partner) return null;

  const typeLabel = getTypeLabel(partner.partnerType);
  const statusLabel = getStatusLabel(partner.status);
  const isPartnerPending = isPending(partner.status);
  const formattedDate = safeCreatedAt();
  const isAdmin = user?.role === 'Admin';

  return (
    <div
      className="fixed inset-0 z-[1050] bg-black/40 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={(e) => { if(e.key === 'Escape' && !busy) onClose(); }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        role="document"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold">
            {t('adminPartnerManager.modal.title', 'Partner details')}
          </h3>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label={t('BUTTON.Close', 'Close')}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div id="modal-description" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label={t('partner.full_name', 'Full name')} value={partner.fullName} />
            <Info label={t('partner.company_name', 'Company')} value={partner.companyName} />
            <Info label="Email" value={partner.email} />
            <Info label={t('partner.phone_number', 'Phone')} value={partner.phoneNumber} />
            <Info label={t('partner.type', 'Type')} value={typeLabel} />
            <Info label={t('common.status', 'Status')} value={statusLabel} />
            <Info label={t('common.createdAt', 'Created')} value={formattedDate} />
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
                {partner.imageUrls.map((url, index) => (
                  <img
                    key={`${partner.partnerID}-img-${index}`}
                    src={url}
                    alt={`${t('partner.image', 'Partner image')} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {isAdmin && isPartnerPending && (
            <div>
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('adminPartnerManager.modal.rejectionReason', 'Rejection reason')}
              </label>
              <textarea
                id="rejection-reason"
                rows="3"
                value={reason}
                onChange={handleReasonChange}
                disabled={busy}
                className="w-full border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('adminPartnerManager.modal.rejectionPlaceholder', 'Write reason if rejecting…')}
                aria-describedby="rejection-help"
              />
              <div id="rejection-help" className="sr-only">
                {t('adminPartnerManager.modal.rejectionHelp', 'Required when rejecting a partner application')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            {t('BUTTON.Close', 'Close')}
          </button>

          {isAdmin && isPartnerPending && (
            <>
              <button
                disabled={busy}
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-describedby="reject-help"
              >
                {busy ? t('BUTTON.Processing', 'Processing...') : t('BUTTON.Reject', 'Reject')}
              </button>
              <button
                disabled={busy}
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {busy ? t('BUTTON.Processing', 'Processing...') : t('BUTTON.Approve', 'Approve')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoized Info component for performance
const Info = ({ label, value }) => (
  <div>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-medium text-gray-900 break-words">{value || '-'}</div>
  </div>
);

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

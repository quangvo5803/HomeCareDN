// src/components/modal/PartnerModal.jsx
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePartnerRequest } from '../../hook/usePartnerRequest';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';

export default function PartnerRequestModal({ isOpen, onClose, partner }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { approvePartner, rejectPartner } = usePartnerRequest();

  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const dialogRef = useRef(null);

  // reset state khi đóng
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setBusy(false);
    }
  }, [isOpen]);

  // esc + trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleEscape);

    // focus phần tử đầu tiên trong dialog
    const dlg = dialogRef.current;
    if (dlg) {
      const first = dlg.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, busy, onClose]);

  const getTypeLabel = useCallback(
    (v) => {
      if (typeof v === 'string') return t(`partner.${v.toLowerCase()}`, v);
      if (v === 0) return t('partner.distributor', 'Distributor');
      if (v === 1) return t('partner.contractor', 'Contractor');
      return String(v ?? '-');
    },
    [t]
  );

  const getStatusKey = useCallback((s) => {
    if (typeof s === 'string') return s.toLowerCase();
    if (s === 0) return 'pending';
    if (s === 1) return 'approved';
    if (s === 2) return 'rejected';
    return 'unknown';
  }, []);

  const getStatusLabel = useCallback(
    (s) => t(`partner.status.${getStatusKey(s)}`, s ?? '-'),
    [t, getStatusKey]
  );

  const isPending = useCallback(
    (s) => getStatusKey(s) === 'pending',
    [getStatusKey]
  );

  const formattedCreatedAt = (() => {
    try {
      return partner?.createdAt
        ? formatDate(partner.createdAt, i18n.language)
        : '-';
    } catch {
      return '-';
    }
  })();

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
        toast.error(
          t(
            'adminPartnerManager.modal.rejectionRequired',
            'Please provide a rejection reason'
          )
        );
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

  if (!isOpen || !partner) return null;

  const isAdmin = user?.role === 'Admin';
  const isPartnerPending = isPending(partner.status);

  return (
    <div className="fixed inset-0 z-[1050] grid place-items-center p-4">
      {/* Overlay là button để đạt chuẩn a11y */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('BUTTON.Close', 'Close')}
        onClick={busy ? undefined : onClose}
      />
      {/* Dialog ngữ nghĩa */}
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="relative z-10 bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold">
            {t('adminPartnerManager.modal.title', 'Partner details')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label={t('BUTTON.Close', 'Close')}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div
          id="modal-description"
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info
              label={t('partner.full_name', 'Full name')}
              value={partner.fullName}
            />
            <Info
              label={t('partner.company_name', 'Company')}
              value={partner.companyName}
            />
            <Info label="Email" value={partner.email} />
            <Info
              label={t('partner.phone_number', 'Phone')}
              value={partner.phoneNumber}
            />
            <Info
              label={t('partner.type', 'Type')}
              value={getTypeLabel(partner.partnerType)}
            />
            <Info
              label={t('common.status', 'Status')}
              value={getStatusLabel(partner.status)}
            />
            <Info
              label={t('common.createdAt', 'Created')}
              value={formattedCreatedAt}
            />
          </div>

          {partner.description && (
            <section aria-label={t('common.description', 'Description')}>
              <div className="p-3 border rounded-lg bg-gray-50 text-gray-800">
                {partner.description}
              </div>
            </section>
          )}

          {Array.isArray(partner.imageUrls) && partner.imageUrls.length > 0 && (
            <section aria-label={t('common.images', 'Images')}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {partner.imageUrls.map((url, i) => (
                  <img
                    key={`${partner.partnerID}-img-${i}`}
                    src={url}
                    alt={`${t('partner.image', 'Partner image')} ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}

          {isAdmin && isPartnerPending && (
            <div>
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t(
                  'adminPartnerManager.modal.rejectionReason',
                  'Rejection reason'
                )}
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={busy}
                className="w-full border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t(
                  'adminPartnerManager.modal.rejectionPlaceholder',
                  'Write reason if rejecting…'
                )}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            {t('BUTTON.Close', 'Close')}
          </button>

          {isAdmin && isPartnerPending && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {busy
                  ? t('BUTTON.Processing', 'Processing...')
                  : t('BUTTON.Reject', 'Reject')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {busy
                  ? t('BUTTON.Processing', 'Processing...')
                  : t('BUTTON.Approve', 'Approve')}
              </button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

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

PartnerRequestModal.propTypes = {
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

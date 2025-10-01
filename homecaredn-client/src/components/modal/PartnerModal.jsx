import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useEnums } from '../../hook/useEnums';
import { usePartner } from '../../hook/usePartner';
import { useAuth } from '../../hook/useAuth'; // Add this import for user context
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';

export default function PartnerModal({ isOpen, onClose, partner }) {
  const { t, i18n } = useTranslation();
  const enums = useEnums();
  const { approvePartner, rejectPartner } = usePartner();
  const { user } = useAuth(); // Get user context
  
  // State variables
  const [fullName, setFullName] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);
  
  // Fill data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (partner) {
        setFullName(partner.fullName || '');
        setPartnerType(partner.partnerType ?? '');
        setCompanyName(partner.companyName || '');
        setEmail(partner.email || '');
        setPhoneNumber(partner.phoneNumber || '');
        setDescription(partner.description || '');
        setStatus(partner.status ?? '');
        setRejectionReason(partner.rejectionReason || '');
      } else {
        // Reset form for new partner (if needed)
        setFullName('');
        setPartnerType('');
        setCompanyName('');
        setEmail('');
        setPhoneNumber('');
        setDescription('');
        setStatus('');
        setRejectionReason('');
      }
      setBusy(false);
    }
  }, [isOpen, partner]);

  // Helper functions
  const getTypeLabel = useCallback((v) => {
    if (typeof v === 'string') return t(`Enums.PartnerType.${v}`, v);
    if (typeof v === 'number') {
      const enumItem = enums?.partnerTypes?.find(item => item.value === v);
      return enumItem ? t(`Enums.PartnerType.${enumItem.key}`) : String(v);
    }
    return String(v ?? '-');
  }, [t, enums]);

  const getStatusKey = useCallback((s) => {
    if (typeof s === 'string') return s;
    if (typeof s === 'number') {
      const enumItem = enums?.partnerStatuses?.find(item => item.value === s);
      return enumItem?.key || 'unknown';
    }
    return 'unknown';
  }, [enums]);

  const getStatusLabel = useCallback((s) => {
    const statusKey = getStatusKey(s);
    return t(`Enums.PartnerStatus.${statusKey}`, statusKey);
  }, [t, getStatusKey]);

  const isPending = useCallback((s) => {
    const statusKey = getStatusKey(s);
    return statusKey === 'Pending' || s === 0;
  }, [getStatusKey]);

  // Format date
  const formattedCreatedAt = (() => {
    try {
      return partner?.createdAt ? formatDate(partner.createdAt, i18n.language) : '-';
    } catch {
      return '-';
    }
  })();

  // Handle approve
  const handleApprove = useCallback(async () => {
    if (busy) return;
    
    try {
      setBusy(true);
      await approvePartner({
        partnerID: partner.partnerID,
        approvedUserId: user?.userID,
      });
      toast.success(t('SUCCESS.APPROVE'));
      onClose();
    } catch (err) {
      handleApiError(err, t);
    } finally {
      setBusy(false);
    }
  }, [busy, approvePartner, partner?.partnerID, user, t, onClose]);

  // Handle reject
  const handleReject = useCallback(async () => {
    if (busy || !rejectionReason.trim()) {
      if (!rejectionReason.trim()) {
        toast.error(t('ERROR.REQUIRED_REJECTION_REASON'));
      }
      return;
    }

    try {
      setBusy(true);
      await rejectPartner({
        partnerID: partner.partnerID,
        rejectionReason: rejectionReason.trim()
      });
      toast.success(t('SUCCESS.REJECT'));
      onClose();
    } catch (err) {
      handleApiError(err, t);
    } finally {
      setBusy(false);
    }
  }, [busy, rejectionReason, rejectPartner, partner?.partnerID, t, onClose]);

  if (!isOpen || !partner) return null;

  const isAdmin = user?.role === 'Admin';
  const isPartnerPending = isPending(partner.status);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1050] p-4 bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto
                  transform transition-all duration-300 scale-100
                  max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {t('adminPartnerManager.partnerModal.title')}
          </h3>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-1 text-gray-400 transition-colors duration-200 rounded-lg hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.fullName')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {fullName || '-'}
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.companyName')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {companyName || '-'}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.email')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {email || '-'}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.phoneNumber')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {phoneNumber || '-'}
              </div>
            </div>

            {/* Partner Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.partnerType')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {getTypeLabel(partnerType)}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.status')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isPending(status) ? 'bg-yellow-100 text-yellow-800' :
                  getStatusKey(status) === 'Approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(status)}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.createdAt')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900">
                {formattedCreatedAt}
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.description')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 min-h-[100px]">
                {description}
              </div>
            </div>
          )}

          {/* Existing Rejection Reason */}
          {rejectionReason && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.existingRejectionReason')}
              </label>
              <div className="w-full px-4 py-3 border rounded-xl bg-red-50 text-red-900">
                {rejectionReason}
              </div>
            </div>
          )}

          {/* Images */}
          {partner.imageUrls && partner.imageUrls.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('adminPartnerManager.partnerModal.images')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {partner.imageUrls.map((url, index) => (
                  <div
                    key={`${partner.partnerID}-img-${index}`}
                    className="relative overflow-hidden border w-full h-28 rounded-xl"
                  >
                    <img
                      src={url}
                      alt={`${t('adminPartnerManager.partnerModal.partnerImage')} ${index + 1}`}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions Section */}
          {isAdmin && isPartnerPending && (
            <div className="space-y-4 p-4 border rounded-xl bg-yellow-50">
              <h4 className="text-lg font-medium text-gray-900">
                {t('adminPartnerManager.partnerModal.adminActions')}
              </h4>
              
              {/* Rejection Reason Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('adminPartnerManager.partnerModal.rejectionReason')}
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={busy}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('adminPartnerManager.partnerModal.rejectionReasonPlaceholder')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={busy}
          >
            {t('BUTTON.Close')}
          </button>

          {isAdmin && isPartnerPending && (
            <>
              <button
                className="px-6 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                onClick={handleReject}
                disabled={busy || !rejectionReason.trim()}
              >
                {busy ? t('BUTTON.Processing') : t('BUTTON.Reject')}
              </button>
              <button
                className="px-6 py-2.5 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                onClick={handleApprove}
                disabled={busy}
              >
                {busy ? t('BUTTON.Processing') : t('BUTTON.Approve')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// PropTypes
PartnerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  partner: PropTypes.shape({
    partnerID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullName: PropTypes.string,
    companyName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    partnerType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    rejectionReason: PropTypes.string,
    approvedUserId: PropTypes.string,
    createdAt: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    imagePublicIds: PropTypes.arrayOf(PropTypes.string),
  }),
  setUploadProgress: PropTypes.func.isRequired,
};

// Default props
PartnerModal.defaultProps = {
  partner: null,
};

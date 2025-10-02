// src/components/modal/PartnerModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePartnerRequest } from '../../hook/usePartnerRequest';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';

export default function PartnerModal({ isOpen, onClose, partnerRequest }) {
  const { t, i18n } = useTranslation();
  const { approvePartnerRequest, rejectPartnerRequest } = usePartnerRequest();

  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (partnerRequest) {
        setReason(partnerRequest.rejectionReason || '');
      } else {
        setReason('');
      }
    }
  }, [isOpen, partnerRequest]);

  const isPending = partnerRequest?.status === 'Pending';

  const formattedCreatedAt = partnerRequest?.createdAt
    ? formatDate(partnerRequest.createdAt, i18n.language)
    : '-';

  const handleSubmit = async (action) => {
    try {
      if (action === 'approve') {
        await approvePartnerRequest(partnerRequest.partnerRequestID);
        toast.success(t('SUCCESS.APPROVE'));
      } else if (action === 'reject') {
        if (!reason.trim()) {
          toast.error(t('ERROR.REQUIRD_REJECT_REASON'));
          return;
        }
        await rejectPartnerRequest({
          PartnerRequestID: partnerRequest.partnerRequestID,
          RejectionReason: reason.trim(),
        });
        toast.success(t('SUCCESS.REJECT'));
      }
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  if (!isOpen || !partnerRequest) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1050] p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            {t(
              'adminPartnerManager.partnerRequestModal.title',
              'Partner Details'
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <Info
            label={t('adminPartnerManager.partnerRequestModal.companyName')}
            value={partnerRequest.companyName}
          />
          <Info label="Email" value={partnerRequest.email} />
          <Info
            label={t('adminPartnerManager.partnerRequestModal.phoneNumber')}
            value={partnerRequest.phoneNumber}
          />
          <Info
            label={t(
              'adminPartnerManager.partnerRequestModal.partnerRequestType'
            )}
            value={t(`Enums.PartnerType.${partnerRequest.partnerRequestType}`)}
          />
          <Info
            label={t('adminPartnerManager.partnerRequestModal.status')}
            value={t(`Enums.PartnerStatus.${partnerRequest.status}`)}
          />
          <Info
            label={t('adminPartnerManager.partnerRequestModal.submittedAt')}
            value={formattedCreatedAt}
          />

          {partnerRequest.description && (
            <div className="p-3 border rounded-lg bg-gray-50 text-gray-800">
              {partnerRequest.description}
            </div>
          )}

          {Array.isArray(partnerRequest.imageUrls) &&
            partnerRequest.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {partnerRequest.imageUrls.map((url, i) => (
                  <img
                    key={`${partnerRequest.partnerID}-img-${i}`}
                    src={url}
                    alt={`${t('partner.image', 'Partner image')} ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}

          {/* Rejection reason for admin */}
          {(isPending || partnerRequest?.status === 'Rejected') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminPartnerManager.partnerRequestModal.rejectReason')}
              </label>
              <textarea
                rows={3}
                value={
                  partnerRequest?.status === 'Rejected'
                    ? partnerRequest?.rejectionReason || ''
                    : reason
                }
                disabled={partnerRequest?.status === 'Rejected'}
                onChange={(e) =>
                  partnerRequest?.status !== 'Rejected' &&
                  setReason(e.target.value)
                }
                className={`w-full border rounded-lg p-3 ${
                  partnerRequest?.status === 'Rejected' ? 'bg-gray-100' : ''
                }`}
                placeholder={t(
                  'adminPartnerManager.partnerRequestModal.rejectReasonPlaceHolder'
                )}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            {t('BUTTON.Close', 'Close')}
          </button>

          {isPending && (
            <>
              <button
                onClick={() => handleSubmit('reject')}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {t('BUTTON.Reject')}
              </button>
              <button
                onClick={() => handleSubmit('approve')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                {t('BUTTON.Approve')}
              </button>
            </>
          )}
        </div>
      </div>
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

PartnerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  partnerRequest: PropTypes.shape({
    partnerID: PropTypes.string,
    partnerRequestID: PropTypes.string.isRequired,
    companyName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    partnerRequestType: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    createdAt: PropTypes.string,
    rejectionReason: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }),
};

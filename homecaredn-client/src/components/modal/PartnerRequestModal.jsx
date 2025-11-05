// src/components/modal/PartnerModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePartnerRequest } from '../../hook/usePartnerRequest';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';
import LoadingComponent from '../LoadingComponent';
import StatusBadge from '../StatusBadge';

export default function PartnerModal({ isOpen, onClose, partnerRequestID }) {
  const { t, i18n } = useTranslation();
  const {
    loading,
    getPartnerRequestById,
    approvePartnerRequest,
    rejectPartnerRequest,
  } = usePartnerRequest();

  const [reason, setReason] = useState('');
  const [partnerRequest, setPartnerRequest] = useState();
  useEffect(() => {
    const fetchPartnerRequest = async () => {
      if (isOpen) {
        if (partnerRequestID) {
          const result = await getPartnerRequestById(partnerRequestID);
          if (result) {
            setPartnerRequest(result);
            setReason(result.reason || '');
            return;
          }
        }
        setPartnerRequest(null);
        setReason('');
      }
    };
    fetchPartnerRequest();
  }, [isOpen, partnerRequestID, getPartnerRequestById]);

  const isPending = partnerRequest?.status === 'Pending';

  const formattedCreatedAt = partnerRequest?.createdAt
    ? formatDate(partnerRequest.createdAt, i18n.language)
    : '-';

  const handleSubmit = async (action) => {
    try {
      if (action === 'approve') {
        await approvePartnerRequest(partnerRequestID);
        toast.success(t('SUCCESS.APPROVE'));
      } else if (action === 'reject') {
        if (!reason.trim()) {
          toast.error(t('ERROR.REQUIRD_REJECT_REASON'));
          return;
        }
        await rejectPartnerRequest({
          PartnerRequestID: partnerRequestID,
          RejectionReason: reason.trim(),
        });
        toast.success(t('SUCCESS.REJECT'));
      }
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  if (!isOpen || !partnerRequestID) return null;

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
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {loading || !partnerRequest ? (
            <div className="flex items-center justify-center py-10">
              <LoadingComponent />
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm text-gray-500">
                  {t('adminPartnerManager.partnerRequestModal.companyName')}
                </div>
                <div className="font-medium text-gray-900 break-words">
                  {partnerRequest.companyName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-900 break-words">
                  {partnerRequest.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t('adminPartnerManager.partnerRequestModal.phoneNumber')}
                </div>
                <div className="font-medium text-gray-900 break-words">
                  {partnerRequest.phoneNumber}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t(
                    'adminPartnerManager.partnerRequestModal.partnerRequestType'
                  )}
                </div>
                <div className="font-medium text-gray-900 break-words">
                  {t(`Enums.PartnerType.${partnerRequest.partnerRequestType}`)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t('adminPartnerManager.partnerRequestModal.status')}
                </div>
                <div className="font-medium text-gray-900 break-words">
                  <StatusBadge
                    status={partnerRequest.status}
                    type="PartnerRequest"
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t('adminPartnerManager.partnerRequestModal.submittedAt')}
                </div>
                <div className="font-medium text-gray-900 break-words">
                  {formattedCreatedAt}
                </div>
              </div>
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border cursor-pointer">
            {t('BUTTON.Close', 'Close')}
          </button>

          {isPending && (
            <>
              <button
                onClick={() => handleSubmit('reject')}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                {t('BUTTON.Reject')}
              </button>
              <button
                onClick={() => handleSubmit('approve')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer"
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

PartnerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  partnerRequestID: PropTypes.string,
};

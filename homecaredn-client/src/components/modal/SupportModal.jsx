// src/components/modal/SupportModal.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import LoadingModal from './LoadingModal';
import { contactSupportService } from '../../services/contactSupportService';

export default function SupportModal({
  isOpen,
  onClose,
  supportID,
  onReplySent,
}) {
  const { t } = useTranslation();

  const [support, setSupport] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && supportID) {
        try {
          setLoading(true);
          const data = await contactSupportService.gettById(supportID);
          setSupport(data);
        } catch (err) {
          toast.error(handleApiError(err));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [isOpen, supportID]);

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast.error(t('adminSupportManager.replyPlaceholder'));
      return;
    }
    try {
      await contactSupportService.reply({
        id: supportID,
        replyContent: reply,
      });
      toast.success(t('SUCCESS.REPLY'));
      onReplySent();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[1050] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {t('adminSupportManager.replyTitle')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading || !support ? (
            <div className="flex justify-center py-8">
              <LoadingModal />
            </div>
          ) : (
            <>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>{t('adminSupportManager.fullName')}:</strong>{' '}
                  {support.fullName}
                </p>
                <p>
                  <strong>{t('adminSupportManager.email')}:</strong>{' '}
                  {support.email}
                </p>
                <p>
                  <strong>{t('adminSupportManager.subject')}:</strong>{' '}
                  {support.subject}
                </p>
                <p>
                  <strong>{t('adminSupportManager.status')}:</strong>{' '}
                  {support.isProcessed
                    ? t('adminSupportManager.processed')
                    : t('adminSupportManager.pending')}
                </p>
              </div>

              <div className="mt-4 border rounded-lg bg-gray-50 p-3 text-gray-800 whitespace-pre-wrap">
                {support.message}
              </div>

              {!support.isProcessed && (
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminSupportManager.replyLabel')}
                  </label>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={t('adminSupportManager.replyPlaceholder')}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {t('BUTTON.Close')}
          </button>
          {!support?.isProcessed && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              {t('BUTTON.Send')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

SupportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  supportID: PropTypes.string,
  onReplySent: PropTypes.func,
};

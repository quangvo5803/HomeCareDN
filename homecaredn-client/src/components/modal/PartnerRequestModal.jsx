import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('info');

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

  const getDocumentIcon = (url) => {
    if (!url) return 'fas fa-file text-gray-400';
    if (url.includes('.pdf')) return 'fas fa-file-pdf text-red-500';
    if (url.includes('.doc') || url.includes('.docx'))
      return 'fas fa-file-word text-blue-500';
    if (url.includes('.txt')) return 'fas fa-file-alt text-gray-500';
    return 'fas fa-file text-gray-400';
  };

  if (!isOpen || !partnerRequestID) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1050] p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            {t('adminPartnerManager.partnerRequestModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'info'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <i className="fas fa-info-circle mr-2" />
            {t('adminPartnerManager.tab.info')}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'documents'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <i className="fas fa-file-alt mr-2" />
            {t('adminPartnerManager.tab.documents')}
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'contract'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <i className="fas fa-file-signature mr-2" />
            {t('adminPartnerManager.tab.contract')}
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
              {/* Tab: Info */}
              {activeTab === 'info' && (
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
                    <div className="text-sm text-gray-500">
                      {t('adminPartnerManager.partnerRequestModal.email')}
                    </div>
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
                      {t(
                        `Enums.PartnerType.${partnerRequest.partnerRequestType}`
                      )}
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
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        {t(
                          'adminPartnerManager.partnerRequestModal.description'
                        )}
                      </div>
                      <div className="p-3 border rounded-lg bg-gray-50 text-gray-800">
                        {partnerRequest.description}
                      </div>
                    </div>
                  )}
                  {Array.isArray(partnerRequest.imageUrls) &&
                    partnerRequest.imageUrls.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          {t('adminPartnerManager.partnerRequestModal.images')}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {partnerRequest.imageUrls.map((url, i) => (
                            <a
                              key={`${partnerRequest.partnerID}-img-${i}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                            >
                              <img
                                src={url}
                                alt={`${t(
                                  'adminPartnerManager.partnerRequestModal.image'
                                )} ${i + 1}`}
                                className="w-full h-24 object-cover rounded-lg border hover:border-orange-500 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center rounded-lg">
                                <i className="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-all" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Rejection reason */}
                  {(isPending || partnerRequest?.status === 'Rejected') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t(
                          'adminPartnerManager.partnerRequestModal.rejectReason'
                        )}
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
                          partnerRequest?.status === 'Rejected'
                            ? 'bg-gray-100'
                            : ''
                        }`}
                        placeholder={t(
                          'adminPartnerManager.partnerRequestModal.rejectReasonPlaceHolder'
                        )}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Tab: Documents & Signature */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <i className="fas fa-file-alt text-blue-500 mr-2" />
                      {t('adminPartnerManager.partnerRequestModal.documents')}
                    </label>
                    {Array.isArray(partnerRequest.documentUrls) &&
                    partnerRequest.documentUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {partnerRequest.documentUrls.map((url, i) => (
                          <a
                            key={`${partnerRequest.partnerRequestID}-doc-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative h-24 rounded-lg border hover:border-blue-500 transition-all overflow-hidden bg-gray-50"
                          >
                            {/* Document Icon Container */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <i
                                className={`${getDocumentIcon(
                                  url
                                )} text-3xl mb-1`}
                              />
                              <p className="text-xs text-gray-600 px-2 text-center truncate w-full">
                                {url.split('/').pop()?.split('?')[0] ||
                                  `${t('common.document')} ${i + 1}`}
                              </p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <i className="fas fa-external-link-alt text-white opacity-0 group-hover:opacity-100 transition-all text-xl" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <i className="fas fa-folder-open text-gray-300 text-4xl mb-2" />
                        <p className="text-sm text-gray-500">
                          {t(
                            'adminPartnerManager.partnerRequestModal.noDocuments'
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Signature */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <i className="fas fa-pen-nib text-green-500 mr-2" />
                      {t('adminPartnerManager.partnerRequestModal.signature')}
                    </label>
                    {partnerRequest.signatureUrl ? (
                      <div className="flex justify-center">
                        <div className="relative inline-block">
                          <img
                            src={partnerRequest.signatureUrl}
                            alt={t(
                              'adminPartnerManager.partnerRequestModal.signature'
                            )}
                            className="max-w-full h-auto max-h-48 border-2 border-gray-300 rounded-lg bg-white p-3"
                          />
                          <a
                            href={partnerRequest.signatureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-external-link-alt text-gray-600 text-xs" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <i className="fas fa-signature text-gray-300 text-4xl mb-2" />
                        <p className="text-sm text-gray-500">
                          {t(
                            'adminPartnerManager.partnerRequestModal.noSignature'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Contract */}
              {activeTab === 'contract' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h4 className="text-center font-bold text-base mb-4 text-gray-900 uppercase">
                      {t(
                        'adminPartnerManager.partnerRequestModal.contractTitle'
                      )}{' '}
                      {partnerRequest.partnerRequestType === 'Contractor'
                        ? t(
                            'partnerRequest.partnerRegistration.step3.contractor'
                          )
                        : t(
                            'partnerRequest.partnerRegistration.step3.distributor'
                          )}
                    </h4>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <strong>
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractPartyA'
                          )}
                          :
                        </strong>{' '}
                        CÔNG TY CỔ PHẦN HOMECARE ĐÀ NẴNG
                      </p>
                      <p>
                        <strong>
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractPartyB'
                          )}
                          :
                        </strong>{' '}
                        {partnerRequest.companyName.toUpperCase()}
                      </p>
                      <p>
                        <strong>
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractRepresentative'
                          )}
                          :
                        </strong>{' '}
                        {partnerRequest.email}
                      </p>

                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="mb-3">
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractContent'
                          )}
                        </p>
                        <p className="italic text-gray-500 mb-3">
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractDetails'
                          )}
                        </p>
                        <p>
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractCommitment'
                          )}
                        </p>
                      </div>

                      {/* Contract Status */}
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-xs font-semibold text-gray-700 uppercase">
                            {t(
                              'adminPartnerManager.partnerRequestModal.contractStatus'
                            )}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              partnerRequest.isContractSigned
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {partnerRequest.isContractSigned
                              ? t(
                                  'adminPartnerManager.partnerRequestModal.signed'
                                )
                              : t(
                                  'adminPartnerManager.partnerRequestModal.unsigned'
                                )}
                          </span>
                        </div>

                        {partnerRequest.signedAt && (
                          <div className="mt-2 p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-700">
                              <i className="fas fa-check-circle mr-2" />
                              {t(
                                'adminPartnerManager.partnerRequestModal.signedAt'
                              )}
                              :{' '}
                              {formatDate(
                                partnerRequest.signedAt,
                                i18n.language
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {t('BUTTON.Close')}
          </button>

          {isPending && (
            <>
              <button
                onClick={() => handleSubmit('reject')}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
              >
                {t('BUTTON.Reject')}
              </button>
              <button
                onClick={() => handleSubmit('approve')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer transition-colors"
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

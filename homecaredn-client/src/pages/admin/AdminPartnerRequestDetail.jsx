import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { usePartnerRequest } from '../../hook/usePartnerRequest';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import LoadingComponent from '../../components/LoadingComponent';

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start py-3.5 border-b border-gray-100 last:border-0 hover:bg-orange-50/50 transition-colors px-4 -mx-4 rounded-lg group">
    <div className="w-1/3 text-sm font-medium text-gray-500 flex items-center gap-2.5">
      {icon && (
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
          <i className={`${icon} text-xs`} />
        </div>
      )}
      <span className="group-hover:text-orange-700 transition-colors">
        {label}
      </span>
    </div>
    <div className="w-2/3 text-sm font-semibold text-gray-800 break-words pl-2">
      {value || <span className="text-gray-300 italic">N/A</span>}
    </div>
  </div>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  icon: PropTypes.string,
};

const ImageGallery = ({ imageUrls }) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
      {imageUrls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-400 transition-all shadow-sm group relative"
        >
          <img
            src={url}
            alt="Evidence"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <i className="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
        </a>
      ))}
    </div>
  );
};

ImageGallery.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string),
};

const DocumentList = ({ documentUrls, noDocsText }) => {
  const getDocumentIcon = (url) => {
    if (!url) return 'fas fa-file text-gray-400';
    if (url.includes('.pdf')) return 'fas fa-file-pdf text-red-500';
    if (url.includes('.doc') || url.includes('.docx'))
      return 'fas fa-file-word text-blue-600';
    if (url.includes('.txt')) return 'fas fa-file-alt text-gray-500';
    return 'fas fa-file text-gray-400';
  };

  if (!Array.isArray(documentUrls) || documentUrls.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-gray-400">{noDocsText}</p>
      </div>
    );
  }

  return (
    <>
      {documentUrls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
        >
          <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors shadow-sm">
            <i className={`${getDocumentIcon(url)} text-lg`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 transition-colors">
              {url.split('/').pop()?.split('?')[0]}
            </p>
          </div>
          <i className="fas fa-external-link-alt text-gray-300 text-xs group-hover:text-blue-400"></i>
        </a>
      ))}
    </>
  );
};

DocumentList.propTypes = {
  documentUrls: PropTypes.arrayOf(PropTypes.string),
  noDocsText: PropTypes.string,
};

const NotFoundView = ({ onBack, text }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 bg-orange-50/30">
    <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-orange-100">
      <i className="fas fa-search text-6xl mb-4 text-orange-200 animate-pulse"></i>
      <p className="text-xl font-bold text-gray-700 mb-6">{text}</p>
      <button
        onClick={onBack}
        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-lg shadow-orange-200"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back
      </button>
    </div>
  </div>
);

NotFoundView.propTypes = {
  onBack: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default function AdminPartnerRequestDetail() {
  const { partnerRequestID } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    loading,
    getPartnerRequestById,
    approvePartnerRequest,
    rejectPartnerRequest,
  } = usePartnerRequest();

  const [activeTab, setActiveTab] = useState('info');
  const [reason, setReason] = useState('');
  const [data, setData] = useState();

  useEffect(() => {
    if (partnerRequestID) {
      getPartnerRequestById(partnerRequestID).then((result) => {
        setData(result || null);
        setReason(result?.reason || '');
      });
    }
  }, [partnerRequestID, getPartnerRequestById]);

  const isPending = data?.status === 'Pending';

  const handleApprove = async () => {
    try {
      await approvePartnerRequest(partnerRequestID);
      toast.success(t('SUCCESS.APPROVE'));
      navigate('/admin/PartnerRequestManager');
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const handleReject = async () => {
    try {
      if (!reason.trim()) {
        toast.error(t('ERROR.REQUIRD_REJECT_REASON'));
        return;
      }
      await rejectPartnerRequest({
        PartnerRequestID: partnerRequestID,
        RejectionReason: reason.trim(),
      });
      toast.success(t('SUCCESS.REJECT'));
      navigate('/admin/PartnerRequestManager');
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  if (loading) return <LoadingComponent />;

  if (!data)
    return (
      <NotFoundView
        onBack={() => navigate('/admin/PartnerRequestManager')}
        text={t('common.notFound')}
      />
    );

  return (
    <div className="min-h-screen bg-[#FFFBF8] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-400 hover:text-orange-600 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 transition-all shadow-sm"
              title={t('BUTTON.Back')}
            >
              <i className="fas fa-arrow-left text-sm group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                {t('adminPartnerManager.partnerRequestModal.title')}
                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1"></span>
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1.5">
                  <i className="far fa-clock text-orange-400"></i>
                  <span>{formatDate(data.createdAt, i18n.language)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Status
            </span>
            <StatusBadge status={data.status} type="PartnerRequest" />
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === LEFT COLUMN: Tabs Container  === */}
          <div className="lg:col-span-8 space-y-6">
            {/* --- TAB NAVIGATION BAR --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex gap-2 select-none">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'info'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-orange-500'
                }`}
              >
                <i className="fas fa-id-card-alt"></i>
                {t('adminPartnerManager.tab.info')}
              </button>

              <button
                onClick={() => setActiveTab('contract')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'contract'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-file-signature"></i>
                {t('adminPartnerManager.tab.contract')}
                {data.isContractSigned ? (
                  <i className="fas fa-check-circle text-xs ml-1 text-green-300"></i>
                ) : (
                  <i className="fas fa-clock text-xs ml-1 text-gray-400"></i>
                )}
              </button>
            </div>

            {/* --- TAB CONTENT AREA --- */}
            <div className="transition-all duration-300">
              {/* === TAB 1: INFO === */}
              {activeTab === 'info' && (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden animate-fade-in-up">
                  {/* Header Gradient Cam */}
                  <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-between">
                    <h2 className="font-bold text-white text-lg flex items-center gap-2">
                      {/* Ambiguous spacing */}
                      <i className="fas fa-info-circle opacity-90"></i>
                      {t('partnerRequest.partnerRegistration.profileDetail')}
                    </h2>
                    <span className="px-3 py-1 bg-white text-orange-600 font-bold text-xs rounded-full shadow-sm">
                      {t(`Enums.PartnerType.${data.partnerRequestType}`)}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-2 mb-6">
                      <InfoRow
                        icon="fas fa-building"
                        label={t(
                          'adminPartnerManager.partnerRequestModal.companyName'
                        )}
                        value={data.companyName}
                      />
                      <InfoRow
                        icon="fas fa-envelope"
                        label={t(
                          'adminPartnerManager.partnerRequestModal.email'
                        )}
                        value={data.email}
                      />
                      <InfoRow
                        icon="fas fa-phone"
                        label={t(
                          'adminPartnerManager.partnerRequestModal.phoneNumber'
                        )}
                        value={data.phoneNumber}
                      />
                    </div>

                    {/* Description */}
                    {data.description && (
                      <div className="relative mt-6 p-6 bg-orange-50 rounded-xl border border-orange-100">
                        <i className="fas fa-quote-left absolute top-4 left-4 text-orange-200 text-2xl"></i>
                        <div className="relative z-10 pl-6">
                          <h3 className="text-xs font-bold text-orange-500 uppercase mb-1">
                            {t(
                              'adminPartnerManager.partnerRequestModal.description'
                            )}
                          </h3>
                          <p className="text-gray-700 italic leading-relaxed whitespace-pre-line text-sm">
                            {data.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Gallery */}
                    {Array.isArray(data.imageUrls) &&
                      data.imageUrls.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i className="fas fa-images text-blue-500"></i>
                            {t(
                              'adminPartnerManager.partnerRequestModal.images'
                            )}
                          </h3>
                          {/* Use extracted component */}
                          <ImageGallery imageUrls={data.imageUrls} />
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* === TAB 2: CONTRACT === */}
              {activeTab === 'contract' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                    <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                        <i className="fas fa-file-contract text-sm"></i>
                      </span>
                      {t(
                        'partnerRequest.partnerRegistration.electronicContract'
                      )}
                    </h2>

                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        data.isContractSigned
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}
                    >
                      <i
                        className={`fas ${
                          data.isContractSigned ? 'fa-check-circle' : 'fa-clock'
                        }`}
                      ></i>
                      {/* Ambiguous spacing handled by block or explicit string concat */}
                      {data.isContractSigned
                        ? t('partnerRequest.partnerRegistration.step3.signed')
                        : t(
                            'partnerRequest.partnerRegistration.step3.unsigned'
                          )}
                    </div>
                  </div>

                  {/* Contract Body */}
                  <div className="p-8 bg-gray-100/50">
                    <div className="bg-white border border-gray-200 p-8 shadow-sm rounded-sm min-h-[400px] relative">
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100 to-transparent pointer-events-none"></div>

                      <div className="text-center mb-8 border-b-2 border-double border-gray-200 pb-4">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                          {t(
                            'partnerRequest.partnerRegistration.step3.contractTitle'
                          )}
                        </h3>
                      </div>
                      {/* Parties Section - Legal Style */}
                      <div className="grid md:grid-cols-2 gap-8 mb-10 font-serif">
                        {/* PARTY A */}
                        <div className="p-6 border border-gray-200 bg-[#f9fafb] relative group">
                          {/* Accent line */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-700"></div>

                          <p className="font-bold text-[11px] tracking-widest text-blue-800 mb-3 flex items-center gap-2">
                            <i className="fas fa-building text-blue-500"></i>
                            {t(
                              'partnerRequest.partnerRegistration.step3.contractPartyA'
                            )}
                          </p>

                          <div className="border-b border-gray-300 pb-4 mb-2">
                            <p className="font-bold text-gray-900 text-lg leading-snug font-[EB Garamond]">
                              {t(
                                'partnerRequest.partnerRegistration.step3.partyA'
                              )}
                            </p>
                          </div>

                          <p className="text-xs text-gray-500 font-sans mt-2">
                            {t('partnerRequest.partnerRegistration.represent')}
                          </p>
                        </div>

                        {/* PARTY B */}
                        <div className="p-6 border border-gray-200 bg-[#fffbf7] relative group">
                          {/* Accent line */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-orange-600"></div>

                          <p
                            className="font-bold text-[11px] 
                           tracking-widest text-orange-800 mb-3 flex items-center gap-2"
                          >
                            <i className="fas fa-user-tie text-orange-500"></i>
                            {t(
                              'partnerRequest.partnerRegistration.step3.contractPartyB'
                            )}
                          </p>

                          <div className="border-b border-orange-200 pb-4 mb-2">
                            <p
                              className="font-bold text-gray-900 text-lg 
                             leading-snug font-[EB Garamond]"
                            >
                              {data.companyName}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-gray-400 font-sans">
                              Email:
                            </span>
                            <p className="text-sm text-gray-700 italic font-serif">
                              {data.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* --- Display Contract --- */}
                      <div className="my-6 relative rounded-sm shadow-sm border border-gray-200 bg-white overflow-hidden">
                        <style>{`
                            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');                           
                            .legal-document {
                            font-family: 'EB Garamond', serif;
                            font-size: 17px;          
                            line-height: 1.75;      
                            color: #1f2937;          
                            text-align: justify;       
                            text-justify: inter-word; 
                            }
                            .legal-document {
                                white-space: pre-wrap; 
                            }
                        `}</style>

                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-blue-400 z-10"></div>

                        <div className="p-8 md:p-10 legal-document bg-[#fffdfa]">
                          <div className="pl-2 md:pl-4">
                            {t(
                              'partnerRequest.partnerRegistration.step3.contractDetails'
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-8">
                        <div className="text-center min-w-[200px]">
                          <p className="text-xs font-bold uppercase text-gray-400 mb-4">
                            {t(
                              'partnerRequest.partnerRegistration.step3.contractPartyB'
                            )}
                          </p>
                          {data.isContractSigned && data.signatureUrl ? (
                            <div className="relative inline-block p-2 border-2 border-dashed border-green-200 bg-green-50/30 rounded-lg">
                              <img
                                src={data.signatureUrl}
                                alt="Signature"
                                className="h-16 object-contain mix-blend-multiply"
                              />
                              <div className="absolute -bottom-3 -right-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <i className="fas fa-check"></i>
                                {t(
                                  'partnerRequest.partnerRegistration.step2.verifyButton'
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 border-2 border-dashed border-gray-300 bg-gray-50 rounded flex items-center justify-center text-gray-400 text-xs">
                              {t(
                                'partnerRequest.partnerRegistration.step3.unsigned'
                              )}
                            </div>
                          )}
                          {data.signedAt && (
                            <p className="text-[10px] text-gray-400 mt-2 font-mono">
                              {formatDate(data.signedAt, i18n.language)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: Actions & Tools === */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4 h-fit">
            {/* 1. Decision Panel */}
            {(isPending || data.status === 'Rejected') && (
              <div
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${
                  data.status === 'Rejected'
                    ? 'border border-gray-200 opacity-90'
                    : 'border border-orange-200 ring-4 ring-orange-50'
                }`}
              >
                <div className="px-5 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                  <h3 className="font-bold text-orange-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-200 text-orange-700 flex items-center justify-center text-xs">
                      <i className="fas fa-gavel"></i>
                    </div>
                    {t('partnerRequest.partnerRegistration.reviewDecision')}
                  </h3>
                </div>

                <div className="p-5">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    {t('adminPartnerManager.partnerRequestModal.rejectReason')}
                  </label>
                  <textarea
                    rows={4}
                    value={
                      data.status === 'Rejected'
                        ? data.rejectionReason || ''
                        : reason
                    }
                    disabled={data.status === 'Rejected'}
                    onChange={(e) =>
                      data.status !== 'Rejected' && setReason(e.target.value)
                    }
                    className={`w-full rounded-xl px-4 py-3 text-sm border focus:ring-2 outline-none transition-all resize-none ${
                      data.status === 'Rejected'
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-white text-gray-900 border-orange-200 focus:border-orange-500 focus:ring-orange-100'
                    }`}
                    placeholder={t(
                      'adminPartnerManager.partnerRequestModal.rejectReasonPlaceHolder'
                    )}
                  />

                  {isPending && (
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <button
                        onClick={handleReject}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-sm transition-all border border-transparent hover:border-red-200"
                      >
                        <i className="fas fa-times"></i>
                        {t('BUTTON.Reject')}
                      </button>
                      <button
                        onClick={handleApprove}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-orange-200"
                      >
                        <i className="fas fa-check"></i>
                        {t('BUTTON.Approve')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Documents List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <i className="fas fa-folder-open text-orange-500"></i>
                  {t('adminPartnerManager.partnerRequestModal.documents')}
                </h3>
                {/* Ambiguous spacing */}
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {data.documentUrls?.length || 0}
                </span>
              </div>

              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {/* Use Extracted Component */}
                <DocumentList
                  documentUrls={data.documentUrls}
                  noDocsText={t(
                    'adminPartnerManager.partnerRequestModal.noDocuments'
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

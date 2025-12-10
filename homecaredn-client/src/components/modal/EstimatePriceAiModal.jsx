import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

// AI Loading Modal Component with Construction Theme
export default function EstimatePriceAiModal({
  isOpen,
  stage,
  progress,
  result = null,
  onClose,
  onSelectPrice,
}) {
  const { t } = useTranslation();
  const [showResult, setShowResult] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  useEffect(() => {
    if (result && progress === 100) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [result, progress]);

  if (!isOpen) return null;

  const stages = [
    {
      id: 1,
      icon: 'fa-clipboard-list',
      title: t('ModalPopup.EstimatePriceAIModal.stage1Title'),
      description: t('ModalPopup.EstimatePriceAIModal.stage1Desc'),
    },
    {
      id: 2,
      icon: 'fa-toolbox',
      title: t('ModalPopup.EstimatePriceAIModal.stage2Title'),
      description: t('ModalPopup.EstimatePriceAIModal.stage2Desc'),
    },
    {
      id: 3,
      icon: 'fa-users-cog',
      title: t('ModalPopup.EstimatePriceAIModal.stage3Title'),
      description: t('ModalPopup.EstimatePriceAIModal.stage3Desc'),
    },
    {
      id: 4,
      icon: 'fa-chart-bar',
      title: t('ModalPopup.EstimatePriceAIModal.stage4Title'),
      description: t('ModalPopup.EstimatePriceAIModal.stage4Desc'),
    },
    {
      id: 5,
      icon: 'fa-hammer',
      title: t('ModalPopup.EstimatePriceAIModal.stage5Title'),
      description: t('ModalPopup.EstimatePriceAIModal.stage5Desc'),
    },
  ];

  const currentStage = stages[stage - 1] || stages[0];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Result View
  if (showResult && result) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
          {/* Success Header with Construction Theme */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4">
              <i className="fas fa-hard-hat text-4xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {t('ModalPopup.EstimatePriceAIModal.resultTitle')}
            </h3>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <i className="fas fa-building"></i>
              {t('ModalPopup.EstimatePriceAIModal.resultSubtitle')}
            </p>
          </div>

          {/* Suggested Description */}
          {result.suggestedDescription && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <i className="fas fa-drafting-compass text-orange-500"></i>
                {t('ModalPopup.EstimatePriceAIModal.suggestedDescription')}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.suggestedDescription}
              </p>
            </div>
          )}

          {/* Construction Notes */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-orange-600"></i>
              {t('ModalPopup.EstimatePriceAIModal.importantNotes')}
            </h4>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <i className="fas fa-wrench mt-0.5 text-orange-500"></i>
                <span>{t('ModalPopup.EstimatePriceAIModal.note1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-boxes mt-0.5 text-orange-500"></i>
                <span>{t('ModalPopup.EstimatePriceAIModal.note2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-handshake mt-0.5 text-orange-500"></i>
                <span>{t('ModalPopup.EstimatePriceAIModal.note3')}</span>
              </li>
            </ul>
          </div>
          {/* Price Estimates with Construction Icons */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Low Estimate */}
            <button
              onClick={() => onSelectPrice && onSelectPrice(result.lowEstimate)}
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <i className="fas fa-coins text-4xl text-blue-500 mb-3"></i>
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {t('ModalPopup.EstimatePriceAIModal.lowEstimate')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(result.lowEstimate)}
                </p>
                <i className="fas fa-check-circle text-xl text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2"></i>
              </div>
            </button>

            {/* Mid Estimate */}
            <button
              onClick={() => onSelectPrice && onSelectPrice(result.midEstimate)}
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <i className="fas fa-hard-hat text-4xl text-blue-500 mb-3"></i>
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {t('ModalPopup.EstimatePriceAIModal.midEstimate')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(result.midEstimate)}
                </p>
                <i className="fas fa-check-circle text-xl text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2"></i>
              </div>
            </button>

            {/* High Estimate */}
            <button
              onClick={() =>
                onSelectPrice && onSelectPrice(result.highEstimate)
              }
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <i className="fas fa-trophy text-4xl text-blue-500 mb-3"></i>
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {t('ModalPopup.EstimatePriceAIModal.highEstimate')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(result.highEstimate)}
                </p>
                <i className="fas fa-check-circle text-xl text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2"></i>
              </div>
            </button>
          </div>
          {/* Action Buttons */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <i className="fas fa-times"></i>
              {t('ModalPopup.EstimatePriceAIModal.closeReference')}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Loading View with Construction Theme
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn">
        {/* Header with Construction Theme */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4 animate-pulse relative">
            <i className="fas fa-building text-3xl text-white"></i>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="fas fa-cog text-white text-xs animate-spin"></i>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <i className="fas fa-hard-hat text-orange-500"></i>
            {t('ModalPopup.EstimatePriceAIModal.processing')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('ModalPopup.EstimatePriceAIModal.pleaseWait')}
          </p>
        </div>

        {/* Current Stage Info with Construction Icons */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <i className={`fas ${currentStage.icon} text-white`}></i>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 mb-1">
                {currentStage.title}
              </h4>
              <p className="text-sm text-gray-600">
                {currentStage.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar with Construction Theme */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <i className="fas fa-tasks text-orange-500"></i>
              {t('ModalPopup.EstimatePriceAIModal.progress')}
            </span>
            <span className="font-semibold text-blue-500">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-5 bg-blue-500"></div>
            </div>
          </div>
        </div>

        {/* Stage Indicators with Construction Icons */}
        <div className="flex justify-between items-center">
          {stages.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  idx + 1 < stage
                    ? 'bg-orange-500 text-white'
                    : idx + 1 === stage
                    ? 'bg-blue-500 text-white scale-110 shadow-lg'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {idx + 1 < stage ? (
                  <i className="fas fa-check"></i>
                ) : idx + 1 === stage ? (
                  <i className="fas fa-hammer text-xs"></i>
                ) : (
                  idx + 1
                )}
              </div>
              <div
                className={`mt-2 w-2 h-2 rounded-full ${
                  idx + 1 <= stage ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* Construction Animation Accent */}
        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <i className="fas fa-tools"></i>
          <span>{t('ModalPopup.EstimatePriceAIModal.processingData')}</span>
          <i className="fas fa-helmet-safety"></i>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

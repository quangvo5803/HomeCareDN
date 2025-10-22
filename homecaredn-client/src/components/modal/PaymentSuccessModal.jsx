import { useTranslation } from 'react-i18next';

export default function PaymentSuccessModal({ open, onClose }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <i className="fas fa-check text-green-600 text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('PaymentSuccessModal.title')}
        </h2>
        <p className="text-gray-600 mb-6">{t('PaymentSuccessModal.text')}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {t('Button.Close')}
        </button>
      </div>
    </div>
  );
}

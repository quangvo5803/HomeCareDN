import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function ReplyModal({
  open,
  onClose,
  item,
  onSubmit,
  mode = 'reply',
}) {
  const { t } = useTranslation();
  const [replyContent, setReplyContent] = useState('');

  const readOnly = mode === 'view';

  useEffect(() => {
    if (!open) return;
    // view: hiển thị nội dung đã trả lời (nếu có); reply: reset rỗng
    const initial = readOnly ? item?.replyContent ?? '' : '';
    setReplyContent(initial);
  }, [open, readOnly, item]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {readOnly ? t('BUTTON.View') : t('adminSupportManager.title')}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <InputField
            label={t('adminSupportManager.email')}
            value={item.email}
            readOnly
          />
          <InputField
            label={t('adminSupportManager.fullName')}
            value={item.fullName}
            readOnly
          />
          <InputField
            label={t('adminSupportManager.subject')}
            value={item.subject}
            readOnly
          />
          <TextareaField
            label={t('adminSupportManager.subtitle')}
            value={item.message}
            readOnly
          />
          <TextareaField
            label={t('adminSupportManager.replyLabel')}
            value={replyContent}
            onChange={
              readOnly ? undefined : (e) => setReplyContent(e.target.value)
            }
            placeholder={t('adminSupportManager.replyPlaceholder')}
            readOnly={readOnly}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          {readOnly ? (
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              {t('BUTTON.Close')}
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={onClose}
              >
                {t('BUTTON.Cancel')}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => onSubmit(replyContent)}
              >
                {t('BUTTON.Reply')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ReplyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['reply', 'view']),
  item: PropTypes.shape({
    id: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    subject: PropTypes.string,
    message: PropTypes.string,
    isProcessed: PropTypes.bool,
    replyContent: PropTypes.string, // nếu API có
  }),
};

// ====== Sub Components ======
function InputField({ label, value, readOnly }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        className="w-full border rounded-lg px-3 py-2 bg-gray-100"
        value={value || ''}
        readOnly={readOnly}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, readOnly }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <textarea
        className={`w-full border rounded-lg px-3 py-2 ${
          readOnly ? 'bg-gray-100' : ''
        }`}
        rows={5}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
};

TextareaField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
};

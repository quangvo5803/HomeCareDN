import i18n from '../configs/i18n';

export const handleApiError = (
  err,
  defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại'
) => {
  // 🛑 Nếu lỗi đã được interceptor xử lý (ví dụ lỗi mạng), bỏ qua
  if (err?._handledByInterceptor) return null;

  let message = err?.response?.data?.message || err?.message || defaultMsg;

  if (err?.response?.data?.errors) {
    const errors = err.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    message = errors[firstKey][0] || message;
  }

  const i18nKey = `ERROR.${message}`;
  return i18n.exists(i18nKey) ? i18n.t(i18nKey) : message;
};

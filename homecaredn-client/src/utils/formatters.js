export function formatVND(n) {
  const num = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(iso, lng) {
  const d = new Date(iso);
  const locale = lng?.startsWith('vi') ? 'vi-VN' : 'en-US';
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

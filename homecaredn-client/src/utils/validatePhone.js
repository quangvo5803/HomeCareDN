// utils/validatePhone.js
export function isSafePhone(phone) {
  if (phone == null) return false;

  const s = String(phone).trim();       // cho phép trim khoảng trắng đầu/cuối
  const regex = /^0\d{9}$/;             // 0 + 9 chữ số = 10 số, chỉ digits
  return regex.test(s);
}


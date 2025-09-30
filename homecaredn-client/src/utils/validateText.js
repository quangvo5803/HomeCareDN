// utils/validateText.js
// Chỉ cho chữ cái (mọi ngôn ngữ, gồm tiếng Việt có dấu) và khoảng trắng.

export function isSafeText(text) {
  if (typeof text !== 'string') return false;

  const s = text.trim();
  if (s.length === 0) return false;

  // Unicode: \p{L} (letters), \p{M} (combining marks), \s (whitespace)
  const regex = /^[\p{L}\p{M}\s]+$/u;

  return regex.test(s);
}

import provincesData from '../data/provinces.json';

/* ===========================
   Helpers / Normalization
=========================== */
const normalizeText = (text = '') => {
  if (typeof text !== 'string') return '';
  let t = text.normalize?.('NFD')?.replace(/[\u0300-\u036f]/g, '') ?? text;
  t = t.replace(/[\u200B-\u200F\uFEFF\u2060]/g, '');
  t = t
    .trim()
    .replace(/[^\S\r\n]+/g, ' ')
    .toLowerCase();
  return t;
};

const vietnameseToDigit = {
  khong: '0',
  không: '0',
  ko: '0',
  mot: '1',
  một: '1',
  hai: '2',
  ba: '3',
  bon: '4',
  bốn: '4',
  nam: '5',
  năm: '5',
  lăm: '5',
  sau: '6',
  sáu: '6',
  bay: '7',
  bảy: '7',
  tam: '8',
  tám: '8',
  chin: '9',
  chín: '9',
};

const convertWordsToDigits = (text) => {
  let t = normalizeText(text);
  for (const [word, digit] of Object.entries(vietnameseToDigit)) {
    const re = new RegExp(word, 'gi'); // bỏ \b
    t = t.replace(re, digit);
  }
  return t;
};

const hasSuspiciousDigits = (rawText = '') => {
  const norm = normalizeText(rawText);
  const converted = convertWordsToDigits(norm);

  const digitsOnly = converted.replace(/\D/g, '');

  return /\d{9,11}/.test(digitsOnly);
};

/* ===========================
   Prepare geo names
=========================== */
const removeAdminPrefix = (name = '') =>
  normalizeText(name).replace(
    /^(?:thanh\s+pho|tp|quan|huyen|phuong|thi\s+xa|xa)\s+/,
    ''
  );

const geoNames = new Set();
provincesData.forEach((p) => {
  const pFull = normalizeText(p.name);
  const pShort = removeAdminPrefix(p.name);
  if (pFull) geoNames.add(pFull);
  if (pShort && pShort !== pFull) geoNames.add(pShort);
  p.districts?.forEach((d) => {
    const dFull = normalizeText(d.name);
    const dShort = removeAdminPrefix(d.name);
    if (dFull) geoNames.add(dFull);
    if (dShort && dShort !== dFull) geoNames.add(dShort);
    d.wards?.forEach((w) => {
      const wFull = normalizeText(w.name);
      const wShort = removeAdminPrefix(w.name);
      if (wFull) geoNames.add(wFull);
      if (wShort && wShort !== wFull) geoNames.add(wShort);
    });
  });
});
const geoNamesList = Array.from(geoNames)
  .filter((n) => n && n.length >= 3)
  .sort((a, b) => b.length - a.length);

/* ===========================
   Patterns
=========================== */
const phonePatterns = [
  /(?:\+?84|0)[\s.\-/()]*(?:\d[\s.\-/()]*){8,12}\d/,
  /(?:\b(?:khong|mot|hai|ba|bon|nam|sau|bay|tam|chin)\b(?:\s+(?:khong|mot|hai|ba|bon|nam|sau|bay|tam|chin)){7,12})/i,
];

const idPatterns = [/(?:cmnd|cccd|chung\s*minh|passport)\s*[:=]?\s*\d{6,12}/i];

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

/* ===========================
   Detect address
=========================== */
const detectAddress = (rawText = '') => {
  if (!rawText) return false;

  const norm = normalizeText(rawText)
    .replace(/[.,;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Số nhà
  const housePattern =
    /(?:s?o|nha|nhà|so|nha\s+so|nha-so|số)[:.\s-]*\d+[a-zA-Z]?(?:\/\d+)?/i;
  if (housePattern.test(norm)) return true;

  // Số + đường
  const streetPattern =
    /\d+[a-zA-Z]?(?:\/\d+)?\s*(?:duong|phố|pho|hem|đường|xa|xã|phuong|phường|quan|quận|tp|thanh\s+pho)/i;
  if (streetPattern.test(norm)) return true;

  // Tên địa lý (ít nhất 2 yếu tố)
  let geoCount = 0;
  for (const name of geoNamesList) {
    const nameNorm = normalizeText(name).replace(/\s+/g, ' ');
    if (norm.includes(nameNorm)) geoCount++;
  }

  return geoCount >= 2;
};

/* ===========================
   Main export
=========================== */
export const detectSensitiveInfo = (rawText) => {
  const text = (rawText || '').trim();
  if (!text) return null;
  if (hasSuspiciousDigits(text)) return 'ERROR.DETECT_UNCESS_INFO';
  if (detectAddress(text)) return 'ERROR.DETECT_UNCESS_INFO';
  if (emailPattern.test(text)) return 'ERROR.DETECT_UNCESS_INFO';

  for (const p of [...phonePatterns, ...idPatterns]) {
    if (p.test(text)) return 'ERROR.DETECT_UNCESS_INFO';
  }

  return null;
};

export default detectSensitiveInfo;

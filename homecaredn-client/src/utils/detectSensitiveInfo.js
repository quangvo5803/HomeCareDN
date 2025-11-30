import provincesData from '../data/provinces.json';

/* ===========================
   Helpers / Normalization
   =========================== */
const normalizeText = (text = '') => {
  if (typeof text !== 'string') return '';

  let t = text.normalize?.('NFD')?.replace(/[\u0300-\u036f]/g, '') ?? text;
  t = t.replace(/[\u200B-\u200F\uFEFF\u2060]/g, '');
  t = t.replace(/([a-zA-Z0-9])([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝ])/g, '$1 $2');

  t = t
    .trim()
    .replace(/[^\S\r\n]+/g, ' ')
    .toLowerCase()
    .trim();

  return t;
};

const vietnameseToDigit = {
  ko: '0',
  khong: '0',
  không: '0',
  mot: '1',
  một: '1',
  hai: '2',
  ba: '3',
  bon: '4',
  bốn: '4',
  nam: '5',
  năm: '5',
  sau: '6',
  sáu: '6',
  bay: '7',
  bảy: '7',
  tam: '8',
  tám: '8',
  chin: '9',
  chín: '9',
};

const countTotalDigits = (rawText = '') => {
  const text = normalizeText(rawText);
  let replaced = text;

  for (const [w, d] of Object.entries(vietnameseToDigit)) {
    replaced = replaced.replace(new RegExp(`\\b${w}\\b`, 'g'), d);
  }

  const digits = replaced.match(/\d/g);
  return digits ? digits.length : 0;
};

const hasSuspiciousDigits = (rawText = '') => {
  const text = normalizeText(rawText);

  // Kiểm tra các chuỗi số với ký tự không phải chữ/số (6-30 ký tự)
  const numericRuns = text.match(/(?:\d[\d\W]{6,30}\d)/g);

  if (numericRuns) {
    for (const run of numericRuns) {
      const digitCount = countTotalDigits(run);
      if (digitCount >= 9 && digitCount <= 13) return true;
    }
  }

  // Kiểm tra tổng số digit trong toàn bộ text
  const totalDigits = countTotalDigits(text);
  return totalDigits >= 9 && totalDigits <= 13;
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
   Excluded / common words (từ chỉ về thiết kế/xây dựng, không phải địa chỉ)
   =========================== */
const excludedWords =
  /\b(thiết kế|xây dựng|mua bán|vật liệu|trang trí|decor|design)\b/i;

const commonWords =
  /\b(thiet\s+ke|kien\s+truc|trang\s+tri|xay\s+dung|decor|design|style|kieu|huong|van|van\s+de|chi\s+phi|chu\s+de|y\s+tuong|phong\s+cach|co\s+dien|hien\s+dai)\b/i;

/* ===========================
   Patterns
   =========================== */
const phonePatterns = [
  /(?:\+?84|0)[\s.\-/()]*(?:\d[\s.\-/()]*){8,12}\d/,
  /(?:\b(?:khong|mot|hai|ba|bon|nam|sau|bay|tam|chin)\b(?:\s+(?:khong|mot|hai|ba|bon|nam|sau|bay|tam|chin)){7,12})/i,
];

const idPatterns = [/(?:cmnd|cccd|chung\s*minh|passport)\s*[:=]?\s*\d{6,12}/i];

const namePattern = [
  /\b[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝ][a-zàáâãèéêìíòóôõùúăđĩũơưỳý]{1,}\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝ][a-zàáâãèéêìíòóôõùúăđĩũơưỳý]{1,}(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝ][a-zàáâãèéêìíòóôõùúăđĩũơưỳý]{1,})?\b/g,
];

const meetingPatterns = [
  /(?:gap\s+truc\s+tiep|hen\s+gap|hen\s+offline|meet\s+in\s+person|offline\s+meeting|gap\s+mat)/i,
];

/* ===========================
   Detect address - chỉ phát hiện địa chỉ thực sự
   =========================== */
const detectAddress = (rawText = '') => {
  if (!rawText) return false;

  const norm = normalizeText(rawText)
    .replace(/[.,;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Nếu text chứa từ loại trừ, không phải địa chỉ
  if (excludedWords.test(norm) || commonWords.test(norm)) {
    return false;
  }

  // Kiểm tra số nhà
  const housePattern =
    /(?:s?o|nha|nhà|so|nha\s+so|nha-so|số)[:.\s-]*\d+[a-zA-Z]?(?:\/\d+)?/i;
  if (housePattern.test(norm)) return true;

  // Kiểm tra số + đường
  const streetPattern =
    /\d+[a-zA-Z]?(?:\/\d+)?\s*(?:duong|phố|pho|hem|đường|xa|xã|phuong|phường|quan|quận|tp|thanh\s+pho)/i;
  if (streetPattern.test(norm)) return true;

  // Kiểm tra tên địa lý (nhưng phải là địa lý, không phải từ chung chung)
  for (const name of geoNamesList) {
    const nameNorm = normalizeText(name).replace(/\s+/g, ' ');
    // Chỉ phát hiện nếu từ địa lý xuất hiện với ngữ cảnh địa chỉ
    if (norm.includes(nameNorm)) {
      // Kiểm tra xem có các từ khóa địa chỉ khác không
      const addressKeywords =
        /(?:so|nha|duong|pho|phuong|quan|huyen|tinh|thanh|pho|xa|thi\s*xa)/i;
      if (addressKeywords.test(norm)) {
        return true;
      }
    }
  }

  return false;
};

/* ===========================
   Main export
   =========================== */
export const detectSensitiveInfo = (rawText) => {
  const text = (rawText || '').trim();

  // Kiểm tra text rỗng hoặc quá ngắn
  if (!text || text.length < 5) return 'ERROR.EMPTY_DESCRIPTION';

  // Kiểm tra số digit nghi vấn (như số điện thoại, số CCCD)
  if (hasSuspiciousDigits(text)) return 'ERROR.DETECT_UNCESS_INFO';

  // Kiểm tra địa chỉ
  if (detectAddress(text)) return 'ERROR.DETECT_UNCESS_INFO';

  // Kiểm tra các pattern nhạy cảm khác
  for (const p of [
    ...phonePatterns,
    ...idPatterns,
    ...namePattern,
    ...meetingPatterns,
  ]) {
    if (p.test(text) || p.test(normalizeText(text))) {
      return 'ERROR.DETECT_UNCESS_INFO';
    }
  }

  return null;
};

export default detectSensitiveInfo;

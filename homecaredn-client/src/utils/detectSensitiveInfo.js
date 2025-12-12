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

// Map chữ số Việt → số
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
    const re = new RegExp(word, 'gi'); // bắt cả khi liền chữ
    t = t.replace(re, digit);
  }
  return t;
};

// Bắt tất cả số 8–13 chữ số (rải, liền, chữ + số)
const hasSuspiciousDigits = (rawText = '') => {
  if (!rawText) return false;
  const converted = convertWordsToDigits(rawText);
  const digitsOnly = converted.replace(/\D/g, '');
  return /\d{8,13}/.test(digitsOnly);
};

/* ===========================
   Geo names
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
   Normalize email tricks
=========================== */
const emailCharMap = {
  ',': '.',
  '，': '.',
  '｡': '.',
  '﹒': '.',
  '﹐': '.',
  '．': '.',
  '＠': '@',
  ' ': '',
  '　': '',
};
const normalizeEmail = (text = '') => {
  let t = text.toLowerCase();
  for (const [k, v] of Object.entries(emailCharMap)) {
    const re = new RegExp(k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    t = t.replace(re, v);
  }
  t = t.replace(/\s*@\s*/g, '@').replace(/\s*\.\s*/g, '.');
  return t;
};
const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

/* ===========================
   Detect address
=========================== */
const constructionKeywords = [
  // --- Khu vực / Rooms ---
  'phong',
  'phòng',
  'phong ngu',
  'phòng ngủ',
  'phong khach',
  'phòng khách',
  'phong an',
  'phòng ăn',
  'phong lam viec',
  'phòng làm việc',
  'phong hoc',
  'phòng học',
  'phong tho',
  'phòng thờ',
  'phong giat',
  'phòng giặt',
  'phong kho',
  'phòng kho',
  'bedroom',
  'master bedroom',
  'guest room',
  'living room',
  'dining room',
  'study room',
  'office room',
  'laundry room',
  'storage room',

  // --- Nhà bếp ---
  'bep',
  'bếp',
  'bep an',
  'bếp ăn',
  'kitchen',
  'open kitchen',
  'island kitchen',

  // --- Nhà vệ sinh / Bathroom ---
  'wc',
  'nha ve sinh',
  'nhà vệ sinh',
  'toilet',
  'bathroom',
  'restroom',
  'ensuite',

  // --- Tầng / Levels ---
  'tang',
  'tầng',
  'lau',
  'lầu',
  'ground floor',
  'first floor',
  'second floor',
  'mezzanine',
  'basement',
  'attic',

  // --- Kiến trúc ngoại thất ---
  'san',
  'sân',
  'san truoc',
  'sân trước',
  'san sau',
  'sân sau',
  'mai',
  'mái',
  'mai ton',
  'mái tôn',
  'mái thai',
  'ban cong',
  'ban công',
  'terrace',
  'balcony',
  'rooftop',
  'yard',
  'garden',
  'front yard',
  'backyard',
  'driveway',
  'garage',
  'carport',

  // --- Nội thất / Finishes ---
  'noi that',
  'nội thất',
  'gach',
  'gạch',
  'gach bong',
  'gạch bông',
  'go',
  'gỗ',
  'sàn gỗ',
  'tiles',
  'ceramic',
  'porcelain',
  'marble',
  'hardwood',
  'laminate',
  'vinyl',

  // --- Kiến trúc / Construction ---
  'ket cau',
  'kết cấu',
  'cot',
  'cột',
  'dam',
  'dầm',
  'mong',
  'móng',
  'tuong',
  'tường',
  'be tong',
  'bê tông',
  'thach cao',
  'trần thạch cao',
  'steel',
  'reinforced concrete',
  'beam',
  'column',
  'foundation',
  'load bearing wall',
  'non load bearing wall',

  // --- Hệ thống MEP ---
  'dien',
  'điện',
  'den',
  'đèn',
  'nuoc',
  'nước',
  'ong nuoc',
  'ống nước',
  'dieu hoa',
  'điều hòa',
  'may lanh',
  'máy lạnh',
  'thong gio',
  'thông gió',
  'lighting',
  'electrical',
  'plumbing',
  'hvac',
  'air conditioning',
  'ventilation',
  'water heater',

  // --- Các khu vực phụ ---
  'san thuong',
  'sân thượng',
  'gac lung',
  'gác lửng',
  'khoang san',
  'khoảng sân',
  'ho ca',
  'hồ cá',
  'tieu canh',
  'tiểu cảnh',
  'fish pond',
  'pond',
  'landscape',
  'garden design',

  // --- Từ miêu tả nhà cửa chung ---
  'nha',
  'nhà',
  'nha o',
  'nhà ở',
  'nha rieng',
  'nhà riêng',
  'biet thu',
  'biệt thự',
  'villa',
  'townhouse',
  'apartment',
  'flat',
  'condo',
  'room',
  'space',
  'open space',
  'layout',
  'floor plan',
];

const detectAddress = (rawText = '') => {
  if (!rawText) return false;
  const norm = normalizeText(rawText)
    .replace(/[.,;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  for (const k of constructionKeywords) {
    if (norm.includes(k)) return false;
  }
  const housePattern =
    /(?:s?o|nha|nhà|so|nha\s+so|nha-so|số)[:.\s-]*\d+[a-zA-Z]?(?:\/\d+)?/i;
  if (housePattern.test(norm)) return true;

  const streetPattern =
    /\d+[a-zA-Z]?(?:\/\d+)?\s*(?:duong|phố|pho|hem|đường|xa|xã|phuong|phường|quan|quận|tp|thanh\s+pho)/i;
  if (streetPattern.test(norm)) return true;

  let geoCount = 0;
  for (const name of geoNamesList) {
    const nameNorm = normalizeText(name).replace(/\s+/g, ' ');
    if (norm.includes(nameNorm)) geoCount++;
  }
  return geoCount >= 2;
};

/* ===========================
   ID Patterns
=========================== */
const idPatterns = [/(?:cmnd|cccd|chung\s*minh|passport)\s*[:=]?\s*\d{6,12}/i];

/* ===========================
   Phone Patterns (optional extra)
=========================== */
const phonePatterns = [/(?:\+?84|0)[\s.\-/()]*(?:\d[\s.\-/()]*){7,12}\d/];

/* ===========================
   Main detection
=========================== */
export const detectSensitiveInfo = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;
  // Phone / digits
  if (hasSuspiciousDigits(rawText)) return 'ERROR.DETECT_UNCESS_INFO';

  // Address
  if (detectAddress(rawText)) return 'ERROR.DETECT_UNCESS_INFO';

  // Email
  const normalizedEmail = normalizeEmail(rawText);
  if (emailPattern.test(normalizedEmail)) return 'ERROR.DETECT_UNCESS_INFO';

  // ID
  for (const p of idPatterns) {
    if (p.test(rawText)) return 'ERROR.DETECT_UNCESS_INFO';
  }

  // Extra phone patterns (optional)
  for (const p of phonePatterns) {
    if (p.test(rawText)) return 'ERROR.DETECT_UNCESS_INFO';
  }

  return null;
};

export default detectSensitiveInfo;

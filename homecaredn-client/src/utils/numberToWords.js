// utils/numberToWords.js

import numberToWords from 'number-to-words';

// Tiếng Việt
function readNumberVI(num) {
  if (num === 0) return 'không';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const numbers = [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
  ];

  function readTriple(triple) {
    let [hundreds, tens, ones] = triple
      .toString()
      .padStart(3, '0')
      .split('')
      .map(Number);
    let result = '';

    if (hundreds > 0) {
      result += numbers[hundreds] + ' trăm';
      if (tens === 0 && ones > 0) result += ' linh';
    }

    if (tens > 1) {
      result += ' ' + numbers[tens] + ' mươi';
      if (ones === 1) result += ' mốt';
      else if (ones === 5) result += ' lăm';
      else if (ones > 0) result += ' ' + numbers[ones];
    } else if (tens === 1) {
      result += ' mười';
      if (ones === 1) result += ' một';
      else if (ones > 0) result += ' ' + numbers[ones];
    } else if (ones > 0) {
      result += ' ' + numbers[ones];
    }

    return result.trim();
  }

  let str = '';
  let i = 0;
  while (num > 0) {
    const triple = num % 1000;
    if (triple > 0) {
      str = readTriple(triple) + ' ' + units[i] + ' ' + str;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return str.trim();
}

// Hàm dùng chung
export function numberToWordsByLang(num, lang = 'vi') {
  if (!num) return '';

  let result = '';
  if (lang.startsWith('vi')) {
    result = readNumberVI(num) + ' đồng';
  } else {
    result = numberToWords.toWords(num) + ' VND';
  }

  // Viết hoa chữ cái đầu
  return result.charAt(0).toUpperCase() + result.slice(1);
}

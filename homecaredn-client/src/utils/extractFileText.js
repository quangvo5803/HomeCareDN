import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import Tesseract from 'tesseract.js';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  '/pdfjs-dist/pdf.worker.min.mjs',
  import.meta.url
).toString();

let worker = null;

// Khởi tạo Tesseract worker với ngôn ngữ tiếng Việt từ local
async function initWorker() {
  if (!worker) {
    try {
      // Sử dụng tessdata từ thư mục public/tessdata
      // Bạn cần tải các file .traineddata về thư mục này
      worker = await Tesseract.createWorker('vie+eng', 1, {
        langPath: new URL('/tessdata', import.meta.url).toString(),
        logger: () => {},
      });

      // Set parameters để tránh warnings và tối ưu cho tiếng Việt
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1',
      });
    } catch {
      //
    }
  }
  return worker;
}

// Preprocessing nâng cao với adaptive threshold
async function preprocessImage(source, method = 'adaptive') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let img;
  if (source instanceof HTMLCanvasElement) {
    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);
  } else {
    img = new Image();
    const url = URL.createObjectURL(source);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (method === 'adaptive') {
    // Tính ngưỡng trung bình của ảnh
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
    }
    const avgThreshold = sum / (data.length / 4);

    // Áp dụng adaptive threshold
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray < avgThreshold ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  } else if (method === 'otsu') {
    // Phương pháp Otsu's binarization (đơn giản hóa)
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      histogram[gray]++;
    }

    // Tìm ngưỡng tối ưu
    const total = canvas.width * canvas.height;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * histogram[i];

    let sumB = 0;
    let wB = 0;
    let maximum = 0;
    let threshold = 0;

    for (let i = 0; i < 256; i++) {
      wB += histogram[i];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;

      sumB += i * histogram[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);

      if (between > maximum) {
        maximum = between;
        threshold = i;
      }
    }

    // Áp dụng threshold
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray < threshold ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Tăng độ tương phản ảnh
async function enhanceContrast(source) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let img;
  if (source instanceof HTMLCanvasElement) {
    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);
  } else {
    img = new Image();
    const url = URL.createObjectURL(source);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = 1.5; // Hệ số tăng contrast

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, (data[i] - 128) * factor + 128);
    data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
    data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// OCR với nhiều phương pháp preprocessing
async function performOCR(source, quick = false) {
  if (
    !(
      source instanceof HTMLImageElement ||
      source instanceof HTMLCanvasElement ||
      source instanceof Blob ||
      source instanceof File ||
      source instanceof Uint8Array ||
      source instanceof ArrayBuffer
    )
  ) {
    return '';
  }

  try {
    const w = await initWorker();

    // Quick mode: chỉ dùng 2 phương pháp tốt nhất
    if (quick) {
      const enhanced = await enhanceContrast(source);
      const resEnhanced = await w.recognize(enhanced);

      const adaptive = await preprocessImage(source, 'adaptive');
      const resAdaptive = await w.recognize(adaptive);

      return resEnhanced.data.text.length > resAdaptive.data.text.length
        ? resEnhanced.data.text
        : resAdaptive.data.text;
    }

    // Full mode: thử nhiều phương pháp
    const results = [];

    // 1. Raw image
    try {
      const resRaw = await w.recognize(source);
      results.push(resRaw.data.text);
    } catch (e) {
      console.warn('Raw OCR failed:', e);
    }

    // 2. Enhanced contrast (thường tốt nhất cho ảnh chụp)
    try {
      const enhanced = await enhanceContrast(source);
      const resEnhanced = await w.recognize(enhanced);
      results.push(resEnhanced.data.text);
    } catch (e) {
      console.warn('Enhanced OCR failed:', e);
    }

    // 3. Adaptive threshold (tốt cho ảnh scan)
    try {
      const adaptive = await preprocessImage(source, 'adaptive');
      const resAdaptive = await w.recognize(adaptive);
      results.push(resAdaptive.data.text);
    } catch (e) {
      console.warn('Adaptive OCR failed:', e);
    }

    // 4. Otsu threshold (tốt cho ảnh có độ tương phản thấp)
    try {
      const otsu = await preprocessImage(source, 'otsu');
      const resOtsu = await w.recognize(otsu);
      results.push(resOtsu.data.text);
    } catch (e) {
      console.warn('Otsu OCR failed:', e);
    }

    // Chọn kết quả dài nhất
    if (results.length === 0) return '';
    return results.reduce((best, current) => {
      return current.length > best.length ? current : best;
    }, '');
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
}

// Làm sạch text tiếng Việt
function cleanOCRText(text) {
  return (
    text
      // Giữ lại ký tự tiếng Việt, chữ cái, số, và dấu câu cơ bản
      .replace(/[^\w\sÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơŨũƯư.,:;!?@()\-+/'"]/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Extract text từ file với tùy chọn quick mode
export async function extractFileText(file, quickMode = false) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') return await extractPdf(file, true, quickMode);
  if (ext === 'docx' || ext === 'doc')
    return await extractDocx(file, true, quickMode);
  if (ext === 'txt') return await extractTxt(file);
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(ext))
    return await extractImage(file, quickMode);

  return '';
}

// PDF với scale cao hơn
async function extractPdf(file, useOCR = false, quickMode = false) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');

    if (pageText.trim()) {
      text += pageText + '\n';
    } else if (useOCR) {
      // Tăng scale lên 3.0 cho chất lượng tốt hơn
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      text += (await performOCR(canvas, quickMode)) + '\n';
    }
  }

  return cleanOCRText(text);
}

// DOCX/DOC
async function extractDocx(file, useOCR = false, quickMode = false) {
  const arrayBuffer = await file.arrayBuffer();
  let text = (await mammoth.extractRawText({ arrayBuffer })).value || '';

  if (useOCR) {
    const docZip = await JSZip.loadAsync(arrayBuffer);
    const images = Object.keys(docZip.files).filter((f) =>
      f.match(/word\/media\/.+\.(png|jpg|jpeg|gif|bmp|tiff?)$/i)
    );
    for (const imgPath of images) {
      const imgData = await docZip.files[imgPath].async('uint8array');
      text += '\n' + (await performOCR(new Blob([imgData]), quickMode));
    }
  }

  return cleanOCRText(text);
}

// TXT
async function extractTxt(file) {
  return cleanOCRText(await file.text());
}

// Image
async function extractImage(file, quickMode = false) {
  return cleanOCRText(await performOCR(file, quickMode));
}

// Multiple files với progress và quick mode option
export async function extractMultipleFiles(
  files,
  onProgress = null,
  quickMode = false
) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(i + 1, files.length, file.name);
    try {
      const text = await extractFileText(file, quickMode);
      results.push({
        fileName: file.name,
        text: text || '(Không có text)',
        success: true,
      });
    } catch (error) {
      results.push({
        fileName: file.name,
        text: '',
        success: false,
        error: error.message,
      });
    }
  }
  return results;
}

// Terminate worker
export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

// Supported extensions
export function getSupportedExtensions() {
  return [
    'pdf',
    'docx',
    'doc',
    'txt',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'tiff',
    'tif',
  ];
}

export function isSupportedFile(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  return getSupportedExtensions().includes(ext);
}

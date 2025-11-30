import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import Tesseract from 'tesseract.js';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

let worker = null;

// Initialize worker once
async function initWorker() {
  if (!worker) {
    worker = await Tesseract.createWorker('vie+eng');
  }
  return worker;
}

async function preprocessImage(source) {
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

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const enhanced = gray > 128 ? 255 : 0;

    data[i] = enhanced;
    data[i + 1] = enhanced;
    data[i + 2] = enhanced;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function performOCR(source) {
  try {
    const worker_instance = await initWorker();

    // Pass 1: Normal OCR
    const result1 = await worker_instance.recognize(source);
    const text1 = result1.data.text;

    // Pass 2: Preprocessed OCR
    const preprocessed = await preprocessImage(source);
    const result2 = await worker_instance.recognize(preprocessed);
    const text2 = result2.data.text;

    // Combine and clean results
    const cleaned1 = cleanOCRText(text1);
    const cleaned2 = cleanOCRText(text2);

    // Use the result with more readable text
    return cleaned1.length > cleaned2.length ? cleaned1 : cleaned2;
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
}

function cleanOCRText(text) {
  return text
    .replace(/[^\w\sÀ-ỹ.,:;!?@#$%&*()\-+=[\]{}'"/\\]/g, '')
    .split('\n')
    .filter((line) => {
      const specialCount = (line.match(/[^a-zA-Z0-9À-ỹ\s]/g) || []).length;
      const totalChars = line.replace(/\s/g, '').length;
      return totalChars === 0 || specialCount / totalChars < 0.5;
    })
    .join('\n')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractFileText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') return await extractPdf(file, true);
  if (ext === 'docx' || ext === 'doc') return await extractDocx(file, true);
  if (ext === 'txt') return await extractTxt(file);

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(ext)
  ) {
    return await extractImage(file);
  }

  return '';
}

async function extractPdf(file, useOCR = false) {
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
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      const ocrText = await performOCR(canvas);
      text += ocrText + '\n';
    }
  }

  return text.trim();
}

async function extractDocx(file, useOCR = false) {
  const arrayBuffer = await file.arrayBuffer();
  let text = '';

  const result = await mammoth.extractRawText({ arrayBuffer });
  text += result.value || '';

  if (useOCR) {
    const docZip = await JSZip.loadAsync(arrayBuffer);
    const images = Object.keys(docZip.files).filter((f) =>
      f.match(/word\/media\/.+\.(png|jpg|jpeg|gif|bmp|tiff?)$/i)
    );

    for (const imgPath of images) {
      const imgData = await docZip.files[imgPath].async('uint8array');
      const blob = new Blob([imgData]);

      const ocrText = await performOCR(blob);
      text += '\n' + ocrText;
    }
  }

  return text.trim();
}

async function extractTxt(file) {
  return await file.text();
}

async function extractImage(file) {
  try {
    const text = await performOCR(file);
    console.log(text);
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
}

export async function extractMultipleFiles(files, onProgress = null) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) onProgress(i + 1, files.length);

    try {
      const text = await extractFileText(file);
      results.push({
        fileName: file.name,
        text: text || '(No text found)',
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

// Cleanup worker khi không dùng nữa
export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

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

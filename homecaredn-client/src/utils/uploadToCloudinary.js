import axios from 'axios';

/**
 * Tải file (image hoặc raw) lên Cloudinary.
 * Tự động xác định maxSize và thông báo lỗi dựa trên resourceType.
 */
export const uploadToCloudinary = async (
  files,
  uploadPreset,
  onProgress,
  folder = 'HomeCareDN',
  resourceType = 'image'
) => {
  if (!files) throw new Error('No file provided');
  if (!uploadPreset) throw new Error('uploadPreset is required');
  // --- 1. Định nghĩa cấu hình dựa trên resourceType ---
  let maxSizeMB;
  let errorCode;
  let errorResourceType;

  if (resourceType === 'raw') {
    // Cấu hình cho tài liệu (document/raw)
    maxSizeMB = 25;
    errorCode = 'ERROR.MAXIMUM_DOCUMENT_SIZE';
    errorResourceType = 'document';
  } else {
    // Mặc định là cấu hình cho ảnh (image)
    maxSizeMB = 5;
    errorCode = 'ERROR.MAXIMUM_IMAGE_SIZE';
    errorResourceType = 'image';
  }

  // --- 2. Xác định endpoint và thông báo lỗi ---
  const uploadUrl = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/${resourceType}/upload`;

  // Sử dụng errorResourceType để tạo thông báo lỗi chính xác
  const errorMessage = `Failed to upload ${errorResourceType}(s)`;
  const consoleErrorMessage = `Upload ${errorResourceType} to Cloudinary failed:`;

  // --- 3. Logic kiểm tra kích thước ---
  const fileArray = Array.isArray(files) ? files : [files];
  const MAX_SIZE_BYTES = maxSizeMB * 1024 * 1024; // Sử dụng maxSizeMB đã định nghĩa ở trên

  const oversizedFile = fileArray.find((f) => f.size > MAX_SIZE_BYTES);
  if (oversizedFile) {
    const error = new Error(errorCode); // Sử dụng errorCode đã định nghĩa
    error.code = errorCode;
    throw error;
  }

  // --- 4. Logic tải lên  ---
  const totalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
  let uploadedBytes = 0;

  const uploadPromises = fileArray.map((file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    return axios.post(uploadUrl, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const currentUploaded = progressEvent.loaded;
          const fileProgress = currentUploaded - (file._lastUploaded || 0);
          file._lastUploaded = currentUploaded;

          uploadedBytes += fileProgress;
          onProgress({
            loaded: uploadedBytes,
            total: totalSize,
          });
        }
      },
    });
  });

  // --- 5. Logic xử lý kết quả  ---
  try {
    const responses = await Promise.all(uploadPromises);
    const results = responses.map((res) => ({
      url: res.data.secure_url,
      publicId: res.data.public_id,
    }));
    return Array.isArray(files) ? results : results[0];
  } catch (error) {
    console.error(consoleErrorMessage, error); // Sử dụng thông báo lỗi động
    throw new Error(errorMessage); // Sử dụng thông báo lỗi động
  }
};

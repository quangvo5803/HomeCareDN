import axios from 'axios';

export const uploadToCloudinary = async (
  files,
  uploadPreset,
  onProgress,
  folder = 'HomeCareDN',
  resourceType = 'image'
) => {
  if (!files) throw new Error('No file provided');
  if (!uploadPreset) throw new Error('uploadPreset is required');

  let maxSizeMB;
  let errorCode;
  let errorResourceType;

  if (resourceType === 'raw') {
    maxSizeMB = 25;
    errorCode = 'ERROR.MAXIMUM_DOCUMENT_SIZE';
    errorResourceType = 'document';
  } else {
    maxSizeMB = 5;
    errorCode = 'ERROR.MAXIMUM_IMAGE_SIZE';
    errorResourceType = 'image';
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/${resourceType}/upload`;

  const errorMessage = `Failed to upload ${errorResourceType}(s)`;
  const consoleErrorMessage = `Upload ${errorResourceType} to Cloudinary failed:`;

  // --- Logic kiểm tra kích thước ---
  const fileArray = Array.isArray(files) ? files : [files];
  const MAX_SIZE_BYTES = maxSizeMB * 1024 * 1024; // Sử dụng maxSizeMB

  const oversizedFile = fileArray.find((f) => f.size > MAX_SIZE_BYTES);
  if (oversizedFile) {
    const error = new Error(errorCode);
    error.code = errorCode;
    throw error;
  }

  // --- Logic tải lên ---
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
          const percent = Math.min(
            100,
            Math.round((uploadedBytes * 100) / totalSize)
          );
          onProgress(percent);
        }
      },
    });
  });

  // --- Logic xử lý kết quả  ---
  try {
    const responses = await Promise.all(uploadPromises);
    const results = responses.map((res) => ({
      url: res.data.secure_url,
      publicId: res.data.public_id,
    }));
    return Array.isArray(files) ? results : results[0];
  } catch (error) {
    console.error(consoleErrorMessage, error);
    throw new Error(errorMessage);
  }
};

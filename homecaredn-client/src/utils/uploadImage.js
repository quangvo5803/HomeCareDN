import axios from 'axios';

export const uploadImageToCloudinary = async (
  files,
  uploadPreset,
  folder = 'HomeCareDN/BrandLogo',
  onProgress
) => {
  if (!files) throw new Error('No file provided');

  // Nếu chỉ là 1 file thì convert thành mảng
  const fileArray = Array.isArray(files) ? files : [files];

  const MAX_SIZE = 5 * 1024 * 1024;
  const oversizedFile = fileArray.find((f) => f.size > MAX_SIZE);
  if (oversizedFile) {
    const error = new Error('ERROR.MAXIMUM_IMAGE_SIZE');
    error.code = 'ERROR.MAXIMUM_IMAGE_SIZE';
    throw error;
  }

  const totalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
  let uploadedBytes = 0;

  const uploadPromises = fileArray.map((file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    return axios.post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      formData,
      {
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
      }
    );
  });

  try {
    const responses = await Promise.all(uploadPromises);

    const results = responses.map((res) => ({
      url: res.data.secure_url,
      publicId: res.data.public_id,
    }));

    return Array.isArray(files) ? results : results[0];
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw new Error('Failed to upload image(s)');
  }
};

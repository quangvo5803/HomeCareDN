import axios from 'axios';
import imageCompression from 'browser-image-compression';

export const uploadImageToCloudinary = async (
  files,
  uploadPreset,
  onProgress,
  folder = 'HomeCareDN'
) => {
  if (!files) throw new Error('No file provided');

  const fileArray = Array.isArray(files) ? files : [files];

  const totalSizeBefore = fileArray.reduce((sum, f) => sum + f.size, 0);
  let uploadedBytes = 0;

  // Hàm nén ảnh
  const compressFile = async (file) => {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  };

  const uploadPromises = fileArray.map(async (file) => {
    const compressedFile = await compressFile(file);

    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    const res = await axios.post(
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
              Math.round((uploadedBytes * 100) / totalSizeBefore)
            );
            onProgress(percent);
          }
        },
      }
    );

    return { url: res.data.secure_url, publicId: res.data.public_id };
  });

  try {
    const results = await Promise.all(uploadPromises);
    return Array.isArray(files) ? results : results[0];
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw new Error('Failed to upload image(s)');
  }
};

// src/api.js
import axios from 'axios';

// Khởi tạo axios instance
const api = axios.create({
  baseURL: 'https://localhost:7155/api',
  withCredentials: true, // gửi kèm cookie (refresh token lưu trong cookie HttpOnly)
});

// ----------------------
// 1. Interceptor Request
// ----------------------
api.interceptors.request.use((config) => {
  // Lấy accessToken từ localStorage
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Biến trạng thái để tránh refresh nhiều lần song song
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý hàng đợi request chờ refresh xong
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ----------------------
// 2. Interceptor Response
// ----------------------
api.interceptors.response.use(
  (response) => response, // Nếu OK thì trả về luôn
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 Unauthorized và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh thì request này chờ trong hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Sau khi refresh thành công thì gắn token mới
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu request này đã retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token (chỉ cần gửi cookie)
        const res = await axios.post(
          'https://localhost:7155/api/Authorize/refresh-token',
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        // Lưu token mới
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;

        // Xử lý hàng đợi request đang chờ
        processQueue(null, newToken);

        // Gửi lại request cũ
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        // Chuyển về login khi refresh thất bại
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

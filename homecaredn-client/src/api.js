import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7155/api', // đổi thành API backend của bạn
});

export default api;

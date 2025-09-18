import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // <--- thêm dòng này để load JS/CSS đúng khi deploy
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7155',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.ADMIN_WEB_API_TARGET || 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/admin/v1': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});

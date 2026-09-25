import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? '/video-editor-pro/' : './',
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      ignored: ['**/agent/**', '**/node_modules/**'],
    },
  },
});

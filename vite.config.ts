/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    host: true,
    allowedHosts: true, // Allows Render domains (e.g. case-zero-qm15.onrender.com) and custom domains
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true,
    allowedHosts: true, // Allows Render domains (e.g. case-zero-qm15.onrender.com) and custom domains
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});

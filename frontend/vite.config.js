import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'REACT_APP_',
  server: {
    port: 3000,
    open: false,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) {
            return 'vendor-redux';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // @xyflow/react is heavy (~100KB) and only used by NetworkGraphViewer
          // tab — kept out of vendor-react so it ships with the lazy chunk.
          if (id.includes('node_modules/@xyflow')) {
            return 'vendor-xyflow';
          }
          if (id.includes('node_modules/dexie')) {
            return 'vendor-dexie';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});

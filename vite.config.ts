import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/engine': path.resolve(__dirname, './src/engine'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-undo'],
          'reactflow-vendor': ['reactflow'],
          'monaco-vendor': ['@monaco-editor/react', 'monaco-editor'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', '@monaco-editor/react'],
  },
});

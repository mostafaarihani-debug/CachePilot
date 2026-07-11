import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['sql.js'],
            },
          },
        },
      },
      {
        entry: 'electron/preload/index.ts',
        onstart: ({ startup }) => startup(),
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            format: 'cjs',
            rollupOptions: {
              external: ['electron'],
              output: {
                entryFileNames: 'index.js',
              },
            },
          },
        },
      },
    ]),
    electronRenderer(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
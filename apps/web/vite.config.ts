import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@aura-grid/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@aura-grid/game-engine': path.resolve(__dirname, '../../packages/game-engine/src/index.ts'),
      '@aura-grid/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  server: { port: 3000, host: '0.0.0.0' },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion'],
          firebase: ['firebase/app', 'firebase/auth'],
        },
      },
    },
  },
});

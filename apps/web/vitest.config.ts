import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'web',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@aura-grid/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@aura-grid/game-engine': path.resolve(__dirname, '../../packages/game-engine/src/index.ts'),
      '@aura-grid/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
});

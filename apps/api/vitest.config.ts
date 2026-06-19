import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@aura-grid/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@aura-grid/game-engine': path.resolve(__dirname, '../../packages/game-engine/src/index.ts'),
    },
  },
});

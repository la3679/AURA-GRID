import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'game-engine',
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@aura-grid/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});

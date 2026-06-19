import { defineWorkspace } from 'vitest/config';

// Each referenced config sets its own environment (node for engine/api, jsdom for web).
export default defineWorkspace([
  './packages/game-engine/vitest.config.ts',
  './apps/api/vitest.config.ts',
  './apps/web/vitest.config.ts',
]);

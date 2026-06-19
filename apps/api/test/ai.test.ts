import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/firebase/authService.js', () => ({
  verifyIdToken: vi.fn(async (token: string) => {
    if (!token.startsWith('test-')) throw new Error('bad token');
    return { uid: token, email: `${token}@grid.test` };
  }),
}));

import { createApp } from '../src/app.js';
import { cache } from '../src/services/cache/cacheService.js';
import { authHeader } from './helpers.js';

const app = createApp();

beforeEach(() => cache.clear());

const validCommentary = {
  event: 'BUMP_L3',
  player: { callsign: 'USER', character: 'TITAN', positions: [0, 0, 0, 0, 0, 0] },
  opponent: { callsign: 'EXO_ECHO', character: 'WRAITH', positions: [0, 0, 0, 0, 0, 0] },
};

describe('AI commentary endpoint', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/ai/commentary').send(validCommentary);
    expect(res.status).toBe(401);
  });

  it('rejects a malformed body', async () => {
    const res = await request(app)
      .post('/api/ai/commentary')
      .set(...authHeader())
      .send({ event: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns safe fallback commentary when Gemini is unavailable', async () => {
    const res = await request(app)
      .post('/api/ai/commentary')
      .set(...authHeader())
      .send(validCommentary);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.commentary).toBe('string');
    expect(res.body.data.commentary.length).toBeGreaterThan(0);
    // Gemini not configured in tests -> first call is computed, not cached.
    expect(res.body.data.cached).toBe(false);
  });

  it('caches repeated identical commentary requests', async () => {
    await request(app)
      .post('/api/ai/commentary')
      .set(...authHeader())
      .send(validCommentary);
    const second = await request(app)
      .post('/api/ai/commentary')
      .set(...authHeader())
      .send(validCommentary);
    expect(second.body.data.cached).toBe(true);
  });
});

describe('AI match summary endpoint', () => {
  it('returns a structured fallback summary', async () => {
    const res = await request(app)
      .post('/api/ai/match-summary')
      .set(...authHeader())
      .send({
        match: {
          winner: 'PLAYER',
          turns: 10,
          bumps: 2,
          lanesCompleted: 3,
          durationSeconds: 240,
          rolls: [6, 5],
          finalPositions: { player: [10, 6, 4, 0, 0, 0], opponent: [0, 0, 0, 0, 0, 0] },
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(Array.isArray(res.body.data.highlights)).toBe(true);
    expect(Array.isArray(res.body.data.improvementTips)).toBe(true);
  });
});

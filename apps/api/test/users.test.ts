import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/firebase/authService.js', () => ({
  verifyIdToken: vi.fn(async (token: string) => {
    if (!token.startsWith('test-')) throw new Error('bad token');
    return { uid: token, email: `${token}@grid.test` };
  }),
}));

import { createApp } from '../src/app.js';
import { __resetUserStore } from '../src/services/users/userService.js';
import { authHeader } from './helpers.js';

const app = createApp();

beforeEach(() => __resetUserStore());

describe('auth middleware', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });
});

describe('session + profile', () => {
  it('bootstraps a profile then reads it back', async () => {
    const create = await request(app)
      .post('/api/auth/session')
      .set(...authHeader('test-uid-1'))
      .send({ callsign: 'NEON-RIDER', selectedClass: 'PRISM', auraColor: '#a855f7' });
    expect(create.status).toBe(200);
    expect(create.body.data.callsign).toBe('NEON-RIDER');

    const me = await request(app)
      .get('/api/users/me')
      .set(...authHeader('test-uid-1'));
    expect(me.status).toBe(200);
    expect(me.body.data.uid).toBe('test-uid-1');
    expect(me.body.data.stats.level).toBe(1);
  });

  it('rejects an invalid profile update', async () => {
    await request(app)
      .post('/api/auth/session')
      .set(...authHeader('test-uid-2'))
      .send({ callsign: 'GHOST', selectedClass: 'VOID', auraColor: '#ef4444' });

    const res = await request(app)
      .put('/api/users/me')
      .set(...authHeader('test-uid-2'))
      .send({ callsign: 'lowercase bad' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

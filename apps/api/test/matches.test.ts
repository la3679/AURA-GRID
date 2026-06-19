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
import { __resetMatchStore } from '../src/services/matches/matchService.js';
import { __resetLeaderboardStore } from '../src/services/leaderboard/leaderboardService.js';
import { authHeader } from './helpers.js';

const app = createApp();
const uid = 'test-player';

const seedProfile = () =>
  request(app)
    .post('/api/auth/session')
    .set(...authHeader(uid))
    .send({ callsign: 'PLAYER-ONE', selectedClass: 'TITAN', auraColor: '#00f3ff' });

beforeEach(() => {
  __resetUserStore();
  __resetMatchStore();
  __resetLeaderboardStore();
});

describe('match lifecycle', () => {
  it('validates the create body', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set(...authHeader(uid))
      .send({ opponentType: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates a match, completes it, and updates stats', async () => {
    await seedProfile();

    const created = await request(app)
      .post('/api/matches')
      .set(...authHeader(uid))
      .send({ opponentType: 'AI', opponentName: 'EXO_ECHO' });
    expect(created.status).toBe(201);
    const matchId = created.body.data.id;

    const completed = await request(app)
      .put(`/api/matches/${matchId}/complete`)
      .set(...authHeader(uid))
      .send({
        status: 'COMPLETED',
        winner: 'PLAYER',
        startedAt: '2026-01-01T00:00:00.000Z',
        endedAt: '2026-01-01T00:05:00.000Z',
        durationSeconds: 300,
        finalPositions: { player: [10, 6, 4, 0, 0, 0], opponent: [1, 0, 0, 0, 0, 0] },
        turns: 12,
        rolls: [6, 5, 4, 3],
        bumps: 2,
        lanesCompleted: 3,
      });
    expect(completed.status).toBe(200);
    expect(completed.body.data.stats.wins).toBe(1);
    expect(completed.body.data.stats.gamesPlayed).toBe(1);
    expect(completed.body.data.stats.bestStreak).toBe(1);
  });

  it('reflects the completed match on the leaderboard', async () => {
    await seedProfile();
    const created = await request(app)
      .post('/api/matches')
      .set(...authHeader(uid))
      .send({ opponentType: 'AI', opponentName: 'EXO_ECHO' });
    await request(app)
      .put(`/api/matches/${created.body.data.id}/complete`)
      .set(...authHeader(uid))
      .send({
        status: 'COMPLETED',
        winner: 'PLAYER',
        startedAt: '2026-01-01T00:00:00.000Z',
        endedAt: '2026-01-01T00:05:00.000Z',
        durationSeconds: 300,
        finalPositions: { player: [10, 6, 4, 0, 0, 0], opponent: [0, 0, 0, 0, 0, 0] },
        turns: 10,
        rolls: [6],
        bumps: 0,
        lanesCompleted: 3,
      });

    const board = await request(app).get('/api/leaderboard');
    expect(board.status).toBe(200);
    expect(board.body.data.length).toBe(1);
    expect(board.body.data[0].callsign).toBe('PLAYER-ONE');
  });
});

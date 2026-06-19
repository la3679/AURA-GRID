# API Reference

Base URL: `${VITE_API_BASE_URL}` (default `http://localhost:4000/api`).

All responses are normalized:

```jsonc
// success
{ "success": true, "data": <T>, "meta": { "requestId": "…", "cached": false } }
// error
{ "success": false, "error": { "code": "…", "message": "…", "details": {} }, "meta": { "requestId": "…" } }
```

Protected routes require `Authorization: Bearer <firebase-id-token>`. The UID is taken
from the verified token — client-supplied UIDs are never trusted.

## Public

### `GET /api/health`
Returns service status. No auth.
```json
{ "status": "ok", "app": "AURA-GRID API", "env": "development",
  "timestamp": "…", "services": { "firebase": "configured|missing", "gemini": "configured|missing" } }
```

### `GET /api/version`
`{ "app": "AURA-GRID API", "version": "1.0.0" }`

### `GET /api/leaderboard`
Normalized, ranked `LeaderboardEntry[]`. Short public cache.

## Auth & Users (protected)

| Method | Route | Body | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/session` | `{ callsign?, selectedClass?, auraColor? }` | `UserProfile` (bootstrapped) |
| GET | `/api/users/me` | — | `UserProfile` |
| PUT | `/api/users/me` | `updateProfileSchema` | `UserProfile` |
| GET | `/api/users/me/stats` | — | `PlayerStats` |

## Matches (protected)

| Method | Route | Body | Returns |
| --- | --- | --- | --- |
| POST | `/api/matches` | `{ opponentType, opponentName }` | `MatchRecord` (201) |
| GET | `/api/matches` | — | `MatchRecord[]` |
| GET | `/api/matches/:id` | — | `MatchRecord` |
| PUT | `/api/matches/:id/complete` | `completeMatchSchema` | `{ match, stats }` |

## Leaderboard (protected)

| Method | Route | Returns |
| --- | --- | --- |
| POST | `/api/leaderboard/sync` | `LeaderboardEntry` |

## AI (protected, rate-limited, cached, fallback-safe)

| Method | Route | Body schema | Returns |
| --- | --- | --- | --- |
| POST | `/api/ai/commentary` | `commentaryRequestSchema` | `{ commentary, cached }` (≤20 words) |
| POST | `/api/ai/match-summary` | `matchSummaryRequestSchema` | `{ summary, highlights[], improvementTips[], cached }` |
| POST | `/api/ai/strategy-tip` | `strategyTipRequestSchema` | `{ bestMoveExplanation, riskLevel, cached }` |
| POST | `/api/ai/opponent-personality` | `opponentPersonalityRequestSchema` | `{ personality, cached }` |
| POST | `/api/ai/daily-challenge` | — | `{ date, title, objective, reward }` |

If Gemini is unavailable, AI routes return safe fallback content (never a 500).

## Error Codes

`VALIDATION_ERROR` (400) · `AUTH_ERROR` (401) · `NOT_FOUND` (404) ·
`RATE_LIMIT` (429) · `EXTERNAL_SERVICE_ERROR` (503) · `INTERNAL_ERROR` (500).
Stack traces are never returned in production.

# Architecture

AURA-GRID is an npm-workspaces monorepo with a strict separation between pure logic,
the client, and the server.

## Layers

### `packages/game-engine`
Pure, framework-agnostic TypeScript. No React, no I/O. The single source of truth for
game rules: `rules.ts`, `validation.ts`, `engine.ts`, `scoring.ts`, `aiPlayer.ts`.

- Deterministic: dice randomness is injectable (`rollDice(rng)`), so tests are reproducible.
- Immutable: `applyMove` returns a new `GameState`; it never mutates inputs.
- Authoritative: the engine — not the UI, not the AI — decides legality and outcomes.

### `packages/shared`
Cross-cutting `types/`, Zod `schemas/`, and `constants/` (lane config, character classes,
default stats/preferences). Shared by both apps so the client and server agree on shapes.

### `packages/ui`
Presentational components (Button, Card, Modal, Input, etc.) themed via CSS variables.

### `apps/web`
React + Vite client. Holds routing (`app/router.tsx`), providers, feature modules
(`features/*`), pages, and the API/Firebase client. **Never calls Gemini directly** —
it talks to `apps/api` at `/api/*`.

### `apps/api`
Express server. Owns Firebase Admin, the Gemini client, the in-memory cache, and all
secrets. Verifies Firebase ID tokens and derives the user's UID from the token only.

## Data Flow

```
Browser ──(Firebase client SDK)──▶ sign in ──▶ ID token
   │
   └─(fetch /api/* with Authorization: Bearer <token>)─▶ apps/api
                                                            │
                            verify token (Admin) ◀──────────┤
                            read/write Firestore  ◀──────────┤
                            call Gemini (cached)  ◀──────────┘
                                                            │
            normalized { success, data, meta } ◀────────────┘
```

- **Client state**: Zustand for local/UI/game state.
- **Server state**: TanStack Query caches reads (profile, stats, matches, leaderboard).
- **Server cache**: in-memory TTL cache fronts Gemini and read-heavy public data.

## Auth Flow

Firebase Auth state (`onAuthStateChanged`) is the source of truth — no manual token
storage. On sign-in the client bootstraps/loads its backend profile. Guests use a
synthetic local profile and never write to Firestore.

## Match Completion Flow

1. The engine reaches `VICTORY`.
2. The client requests an AI match summary (`/api/ai/match-summary`).
3. For authenticated users: `POST /api/matches` then `PUT /api/matches/:id/complete`.
4. The server updates aggregate stats and syncs the leaderboard from the verified outcome.
5. The client invalidates `matches`, `stats`, and `leaderboard` queries.

## Determinism Boundary

Gemini output is advisory only and validated/clamped before display. The AI opponent
(`aiPlayer.ts`) is a deterministic scorer, fully testable with fixed inputs.

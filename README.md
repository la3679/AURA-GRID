# AURA-GRID // SPLIT

> Split the signal. Control the lanes.

A futuristic strategic lane-based board game platform. Partition each numeric roll
across six tactical lanes, race to complete lanes, bump opponents off their
progress, and capture the grid. AURA-GRID is a SaaS/game hybrid: a polished landing
experience, Firebase auth, a player dashboard, a redesigned game, a leaderboard, and
Gemini-powered AI commentary — all backed by a secure API and a fully tested,
framework-agnostic game engine.

## Screenshots

> _Placeholders — add captures after running locally._
>
> - `docs/screenshots/landing.png`
> - `docs/screenshots/dashboard.png`
> - `docs/screenshots/game.png`

## Features

- **Original branding** — in-code SVG logo, intro boot loader, animated explainer (with MP4 fallback).
- **Auth** — Firebase email/password, signup with class + aura color, forgot password, **guest mode**.
- **Game** — redesigned board, move planner with live validation, AI commentary, strategy hints, victory debrief.
- **Dashboard** — level/XP, win rate, streaks, lanes, bumps, recent matches, AI insight, daily directive.
- **Profile & Settings** — edit identity, theme (dark/light/system), motion/sound/commentary, data export.
- **Leaderboard & match history** — ranked operatives, match detail with final board + AI summary.
- **AI (Gemini)** — commentary, match summaries, strategy tips — **backend-only**, cached, with safe fallbacks.
- **Quality** — TypeScript strict, unit/component/API tests, E2E, CI, accessibility, responsive, theming.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind v4, React Router, Zustand, TanStack Query, Motion, lucide-react, Firebase client |
| Backend | Node, Express, TypeScript, Firebase Admin, `@google/genai`, Zod, Helmet, CORS, rate-limiting |
| Shared | `@aura-grid/shared` (types/schemas/constants), `@aura-grid/game-engine` (pure rules), `@aura-grid/ui` (components) |
| Tooling | npm workspaces, ESLint, Prettier, Vitest, Testing Library, Supertest, Playwright |

## Architecture Overview

npm-workspaces monorepo:

```
apps/web   → React client (no secrets; calls /api/*, never Gemini directly)
apps/api   → Express server (owns Firebase Admin, Gemini, cache, all secrets)
packages/game-engine → pure, deterministic, tested game logic (no React)
packages/shared      → types, Zod schemas, constants
packages/ui          → presentational components
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Local Setup

```bash
npm install
cp .env.example apps/web/.env.local   # fill VITE_* (Firebase web config)
cp .env.example apps/api/.env         # fill backend secrets (Gemini, Firebase Admin)
npm run dev                            # web on :3000, api on :4000
```

The app runs **without credentials**: play guest matches and the API serves safe AI
fallbacks. Add Firebase to enable accounts; add Gemini to enable live AI.

### Environment Variables

See [.env.example](.env.example). Only `VITE_*` values reach the browser. Gemini and
Firebase Admin credentials are **backend-only**.

- Firebase setup → [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)
- Gemini setup → [docs/GEMINI_SETUP.md](docs/GEMINI_SETUP.md)

## Running

```bash
npm run dev        # both apps
npm run dev:web    # frontend only
npm run dev:api    # backend only
npm run build      # typecheck + build web (api runs via tsx)
npm run start:api  # run the API
```

## Testing

```bash
npm run test           # unit + component + API (Vitest)
npm run test:coverage  # with coverage
npm run test:e2e       # Playwright (run `npx playwright install` first)
```

See [docs/TESTING.md](docs/TESTING.md).

## Git Workflow

Branches: `main` → `dev` → `test`, plus `feature/* fix/* chore/* release/* hotfix/*`.
Conventional Commits, PR into `dev`, CI must pass. See [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).

## Deployment

Two documented paths (split hosting or Firebase). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Troubleshooting

- **`Cannot find module '../lightningcss.*.node'`** on Windows: a native optional dep
  failed to install. Run `npm install lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc`.
- **AI returns fallback text**: Gemini key missing/invalid — this is expected and safe.
- **Login fails / "Profile service unavailable"**: Firebase not configured — use guest mode.

## Security Notes

- No secrets in the frontend. Gemini + Firebase Admin are backend-only.
- All API inputs validated with Zod; AI endpoints rate-limited.
- Firebase ID tokens verified server-side; the trusted UID comes from the token only.
- `.env*` and service-account files are git-ignored.

## Roadmap

- Online multiplayer (planned, not faked).
- Firebase Storage avatars.
- Friends / weekly leaderboard filters.
- Daily challenge generation via Gemini.

---

**TERMINAL ACCESS GRANTED. GOOD LUCK ON THE GRID.**

# Testing

AURA-GRID uses Vitest (unit + component), Supertest (API), and Playwright (E2E).
External services (Firebase, Gemini) are mocked or degrade to fallbacks — **no real
credentials are required** to run the suite.

## Commands

```bash
npm run test            # all unit + component + API projects (Vitest workspace)
npm run test:watch      # watch mode
npm run test:coverage   # with V8 coverage
npm run test:e2e        # Playwright (run `npx playwright install` once first)
```

The Vitest workspace (`vitest.workspace.ts`) runs three projects, each with its own
environment:
- `packages/game-engine` — node
- `apps/api` — node
- `apps/web` — jsdom (setup in `apps/web/test/setup.ts`)

## Unit tests — game engine
Location: `packages/game-engine/test/`.

- Initial game state is valid; dice roll ∈ 1–6 (RNG injected for determinism).
- A valid move sums exactly to the roll; over- and under-roll are rejected.
- A move cannot exceed a lane's maximum steps.
- A bump resets the opponent on the same lane+position; completed lanes are locked.
- Completed lanes count correctly; victory triggers at three; not before.
- AI returns a valid move when one exists and passes when none do; it is deterministic.
- Move generation yields multiple valid split combinations.

## API tests
Location: `apps/api/test/`. Built on Supertest; Firebase token verification is mocked
(`Bearer test-*` ⇒ authenticated); Gemini falls back (no key in CI).

- Health returns ok with service status; unknown routes return a normalized 404.
- Auth middleware rejects missing tokens.
- Session bootstraps a profile; invalid profile updates are rejected.
- Match creation validates the body; completion updates stats and the leaderboard.
- AI commentary rejects malformed bodies, returns fallback when Gemini is down, and
  caches repeated identical requests.

## Component tests
Location: `apps/web/test/`. React Testing Library + jsdom.

- Theme toggle cycles theme and applies the class to `<html>`.
- Login form shows validation errors on empty submit.
- Signup form flags mismatched passwords.
- Game board renders six lanes.
- Move planner disables **Execute** until the allocation equals the roll.

## E2E tests
Location: `e2e/`. Playwright drives guest-mode flows against the dev server (no Firebase
needed): landing loads, navigate to signup, start a guest match and render the board,
toggle theme. Run `npx playwright install` once to fetch browsers.

## Mocking strategy
- **Firebase Auth (API):** `vi.mock` the auth service so protected routes can be tested.
- **Firebase Firestore (API):** unconfigured in tests ⇒ in-memory repositories (reset
  between tests via the exported `__reset*Store` helpers).
- **Gemini:** unconfigured/invalid key ⇒ deterministic fallback content.
- **Frontend network:** components are tested in isolation; service calls are not hit on
  the validation paths under test.

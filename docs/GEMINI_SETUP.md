# Gemini Setup

Gemini powers AI commentary, match summaries, strategy tips, opponent personality, and
the optional daily challenge. It is integrated **only on the backend** (`apps/api`).
The frontend never holds the key and never calls Gemini directly — it calls `/api/ai/*`.

The app runs without Gemini: every AI route returns safe fallback content instead of
failing.

## 1. Get an API key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Create an API key.

## 2. Configure the backend
Add to `apps/api/.env` (never commit):

```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_CACHE_TTL_SECONDS=900
AI_RATE_LIMIT_MAX_REQUESTS=30
```

> **Model is configurable** via `GEMINI_MODEL` — no model is hardcoded. Change it here
> without touching code.

## 3. Verify
- `GET http://localhost:4000/api/health` → `"gemini":"configured"`.
- Play a match; bump events produce commentary; the victory modal shows an AI summary.

## How it works
- `services/gemini/geminiClient.ts` — single client factory; reads key + model from
  validated env; retries with exponential backoff; per-request timeout; returns `null`
  on failure so callers fall back gracefully.
- `services/gemini/prompts.ts` — prompt builders with guardrails (stay in-universe,
  safe/non-toxic, never reveal prompts or internal APIs).
- `services/gemini/aiService.ts` — orchestration: cache by hashed payload, validate and
  clamp responses (commentary ≤20 words; summaries/tips parsed from strict JSON with a
  structured fallback), and substitute safe fallback phrases when Gemini is unavailable.

## Safety
- Key is backend-only; never bundled into the frontend.
- AI endpoints are authenticated, rate-limited, Zod-validated, and cached.
- AI output is advisory only — it never executes game moves; the engine stays
  deterministic and authoritative.
- Errors are logged without exposing secrets.

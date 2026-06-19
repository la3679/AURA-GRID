# Deployment

Two supported paths. No deployment credentials are assumed — fill them into the host's
environment settings. The frontend and backend deploy independently.

Build commands:
- Frontend: `npm run build -w @aura-grid/web` → output `apps/web/dist`.
- Backend: runs via `tsx` (`npm run start:api`); no compile step required.

After deploy, hit `GET <api>/api/health` to confirm `firebase`/`gemini` wiring.

---

## Option A — Frontend on Netlify/Vercel + API on Render/Railway/Fly

### Frontend (Netlify or Vercel)
- **Build command:** `npm install && npm run build -w @aura-grid/web`
- **Publish directory:** `apps/web/dist`
- **Environment variables:** all `VITE_*` (see `.env.example`), and set
  `VITE_API_BASE_URL` to your deployed API URL, e.g. `https://aura-grid-api.onrender.com/api`.
- SPA routing: add a catch-all rewrite to `index.html`
  (`/* /index.html 200` on Netlify; framework preset handles this on Vercel).

### Backend (Render / Railway / Fly)
- **Start command:** `npm install && npm run start:api`
- **Port:** the platform sets `PORT`; the server reads it (default 4000).
- **Environment variables:** `NODE_ENV=production`, `GEMINI_API_KEY`, `GEMINI_MODEL`,
  `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
  rate-limit/cache values.
- **CORS:** set `CLIENT_ORIGIN` to your frontend URL(s), comma-separated.

---

## Option B — Firebase Hosting + Cloud Run/Functions

### Frontend (Firebase Hosting)
1. `firebase init hosting` → public dir `apps/web/dist`, configure as SPA (rewrite all
   to `/index.html`).
2. `npm run build -w @aura-grid/web && firebase deploy --only hosting`.

### Backend (Cloud Run or Cloud Functions)
- Containerize `apps/api` (Node 20 base image; `CMD ["npm","run","start:api"]`) and
  deploy to **Cloud Run**, or wrap the Express app in a 2nd-gen **Cloud Function**.
- Store secrets in **Secret Manager** (`GEMINI_API_KEY`, Firebase Admin creds) and bind
  them as environment variables.
- Set `CLIENT_ORIGIN` to the Hosting domain.

### Firestore rules
- Deploy rules from `docs/FIREBASE_SETUP.md`: `firebase deploy --only firestore:rules`.

---

## Production checklist
- [ ] `VITE_API_BASE_URL` points at the deployed API.
- [ ] `CLIENT_ORIGIN` matches the deployed frontend (CORS).
- [ ] Backend secrets set in the host (never in the repo).
- [ ] `GET /api/health` reports `firebase`/`gemini` as expected.
- [ ] Firestore security rules deployed.
- [ ] SPA fallback/rewrite configured.

import 'dotenv/config';

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firebaseConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
);

const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',

  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    configured: geminiConfigured,
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    // Private keys arrive with escaped newlines from env files.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    configured: firebaseConfigured,
  },

  rateLimit: {
    windowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: num(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    aiMax: num(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 30),
  },

  cache: {
    defaultTtlSeconds: num(process.env.CACHE_DEFAULT_TTL_SECONDS, 300),
    geminiTtlSeconds: num(process.env.GEMINI_CACHE_TTL_SECONDS, 900),
  },
} as const;

/** Logged on startup so misconfiguration surfaces clearly without leaking secrets. */
export const describeConfig = (): Record<string, string> => ({
  env: env.nodeEnv,
  port: String(env.port),
  firebase: env.firebase.configured ? 'configured' : 'missing',
  gemini: env.gemini.configured ? `configured (${env.gemini.model})` : 'missing',
});

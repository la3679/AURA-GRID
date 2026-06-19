import { env } from '../config/env.js';

type Level = 'info' | 'warn' | 'error' | 'debug';

const SECRET_KEYS = /(authorization|token|key|secret|password|privatekey)/i;

/** Shallowly redact secret-looking fields so tokens/keys never hit the logs. */
const redact = (meta: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = SECRET_KEYS.test(k) ? '[redacted]' : v;
  }
  return out;
};

const write = (level: Level, msg: string, meta?: Record<string, unknown>): void => {
  const entry = {
    level,
    msg,
    time: new Date().toISOString(),
    ...(meta ? redact(meta) : {}),
  };
  const line = env.isProd ? JSON.stringify(entry) : `[${level.toUpperCase()}] ${msg}`;
  if (level === 'error') console.error(line, env.isProd ? '' : (meta ?? ''));
  else if (level === 'warn') console.warn(line, env.isProd ? '' : (meta ?? ''));
  else console.log(line, env.isProd ? '' : (meta ?? ''));
};

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => write('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (!env.isProd) write('debug', msg, meta);
  },
};

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Simple in-memory TTL cache with hit/miss metadata and periodic cleanup. */
export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();
  public hits = 0;
  public misses = 0;

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  /** Return a cached value or compute, store, and return it. */
  async wrap<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<{
    value: T;
    cached: boolean;
  }> {
    const existing = this.get<T>(key);
    if (existing !== undefined) return { value: existing, cached: true };
    const value = await compute();
    this.set(key, value, ttlSeconds);
    return { value, cached: false };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  get size(): number {
    return this.store.size;
  }
}

export const cache = new TtlCache();

// Periodic cleanup (no-op in test environments without timers running).
const interval = setInterval(() => cache.cleanup(), 60_000);
if (typeof interval.unref === 'function') interval.unref();

/** Stable hash of a payload for cache keys. */
export const hashKey = (prefix: string, payload: unknown): string => {
  const json = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    hash = (hash << 5) - hash + json.charCodeAt(i);
    hash |= 0;
  }
  return `${prefix}:${hash.toString(36)}`;
};

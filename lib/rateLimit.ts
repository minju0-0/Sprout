const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
interface Bucket {
  count: number;
  windowStart: number;
}
const buckets = new Map<string, Bucket>();
export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000),
    };
  }
  bucket.count += 1;
  return { allowed: true };
}

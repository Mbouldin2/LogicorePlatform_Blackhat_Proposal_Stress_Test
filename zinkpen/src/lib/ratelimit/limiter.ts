/* =============================================================================
   Rate limiting — fixed-window counter with a pluggable backend.

   • Production: Upstash Redis (REST, no SDK) when UPSTASH_REDIS_REST_URL +
     UPSTASH_REDIS_REST_TOKEN are set — durable + correct across serverless
     instances.
   • Otherwise: in-memory fallback (per-instance) so the app and demo mode work
     with zero infrastructure. Documented as best-effort for multi-instance.

   Fails OPEN: any backend error allows the request (availability > strictness),
   and the whole limiter can be disabled with RATE_LIMIT_DISABLED=true.
   ============================================================================= */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
}

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

function disabled(): boolean {
  return process.env.RATE_LIMIT_DISABLED === "true" || process.env.RATE_LIMIT_DISABLED === "1";
}

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function rateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  const { limit, windowSec } = opts;
  if (disabled() || limit <= 0) {
    return { allowed: true, limit, remaining: limit, retryAfterSec: 0 };
  }
  try {
    return upstashConfigured()
      ? await upstashLimit(key, limit, windowSec)
      : memoryLimit(key, limit, windowSec);
  } catch (err) {
    // Fail open — never block a user because the limiter backend hiccupped.
    // Lazy import to keep this module free of server-only deps for tests.
    void import("@/lib/logger").then(({ captureException }) =>
      captureException(err, { scope: "ratelimit", key }),
    );
    return { allowed: true, limit, remaining: limit, retryAfterSec: 0 };
  }
}

// ---------------------------------------------------------------------------
// Upstash Redis (REST pipeline)
// ---------------------------------------------------------------------------
async function upstashLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const namespaced = `ratelimit:${key}`;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    // INCR, then set the TTL only if not already set (fixed window), then read TTL.
    body: JSON.stringify([
      ["INCR", namespaced],
      ["EXPIRE", namespaced, String(windowSec), "NX"],
      ["TTL", namespaced],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = (await res.json()) as { result: number }[];
  const count = Number(data[0]?.result ?? 0);
  const ttl = Number(data[2]?.result ?? windowSec);
  const remaining = Math.max(0, limit - count);
  return {
    allowed: count <= limit,
    limit,
    remaining,
    retryAfterSec: count <= limit ? 0 : Math.max(1, ttl),
  };
}

// ---------------------------------------------------------------------------
// In-memory fixed window (single instance)
// ---------------------------------------------------------------------------
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

function memoryLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  // Opportunistic sweep so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }

  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  const allowed = b.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - b.count),
    retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
  };
}

/** Test-only: reset the in-memory store. */
export function __resetMemoryLimiter() {
  buckets.clear();
}

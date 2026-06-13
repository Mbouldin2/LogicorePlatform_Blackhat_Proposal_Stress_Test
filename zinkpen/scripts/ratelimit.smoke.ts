/**
 * Rate-limiter smoke test — proves the in-memory fixed-window limiter allows up
 * to `limit` requests then blocks, exposes Retry-After, resets after the window,
 * isolates keys, and can be disabled by env. Run: npm run test:ratelimit
 */
import { rateLimit, __resetMemoryLimiter } from "../src/lib/ratelimit/limiter";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const pass = actual === expected;
  if (!pass) failures++;
  console.log(`${pass ? "✅" : "❌"} ${label} — expected ${expected}, got ${actual}`);
}

async function main() {
  __resetMemoryLimiter();
  const opts = { limit: 3, windowSec: 60 };

  console.log("— allows up to the limit, then blocks —");
  const r1 = await rateLimit("k1", opts);
  const r2 = await rateLimit("k1", opts);
  const r3 = await rateLimit("k1", opts);
  const r4 = await rateLimit("k1", opts);
  check("request 1 allowed", r1.allowed, true);
  check("request 3 allowed", r3.allowed, true);
  check("request 4 blocked", r4.allowed, false);
  check("remaining after 3 is 0", r3.remaining, 0);
  check("blocked response sets Retry-After > 0", r4.retryAfterSec > 0, true);

  console.log("\n— keys are isolated —");
  const other = await rateLimit("k2", opts);
  check("different key still allowed", other.allowed, true);

  console.log("\n— window reset —");
  __resetMemoryLimiter();
  const short = { limit: 1, windowSec: 1 };
  const a = await rateLimit("k3", short);
  const b = await rateLimit("k3", short);
  check("first allowed", a.allowed, true);
  check("second blocked", b.allowed, false);
  await new Promise((r) => setTimeout(r, 1100));
  const c = await rateLimit("k3", short);
  check("allowed again after window", c.allowed, true);

  console.log("\n— disable switch —");
  process.env.RATE_LIMIT_DISABLED = "true";
  __resetMemoryLimiter();
  let allAllowed = true;
  for (let i = 0; i < 10; i++) {
    const r = await rateLimit("k4", { limit: 1, windowSec: 60 });
    if (!r.allowed) allAllowed = false;
  }
  check("disabled -> always allowed", allAllowed, true);
  delete process.env.RATE_LIMIT_DISABLED;

  console.log("");
  if (failures > 0) {
    console.error(`❌ ${failures} rate-limit check(s) failed.`);
    process.exit(1);
  }
  console.log("✅ All rate-limit checks passed.");
}

main();

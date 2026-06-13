import "server-only";
import { NextResponse } from "next/server";
import { getOptionalTenant, type Tenant } from "@/lib/data/tenant";
import { checkQuota } from "@/lib/data/quota";
import { requireRole } from "@/lib/auth/guard";
import { canCreateContent, type Role } from "@/lib/auth/roles";
import { rateLimit, type RateLimitResult } from "@/lib/ratelimit/limiter";
import { PLANS } from "@/lib/constants";

export type GuardResult = { tenant: Tenant } | { error: NextResponse };

const AI_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_AI_PER_MIN ?? 30);

/** Build a 429 response from a rate-limit result, including Retry-After. */
function tooManyRequests(rl: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "rate_limited",
      message: "You're sending requests too quickly. Please wait a moment and try again.",
      retryAfter: rl.retryAfterSec,
    },
    { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
  );
}

/** Generic per-key rate limit for any route. Returns a 429 response when the
 *  limit is exceeded, or `null` to proceed. */
export async function enforceRateLimit(
  key: string,
  opts: { limit: number; windowSec: number },
): Promise<NextResponse | null> {
  const rl = await rateLimit(key, opts);
  return rl.allowed ? null : tooManyRequests(rl);
}

/** Role guard for API routes — returns the tenant or a ready 401/403 response. */
export async function apiRequireRole(min: Role): Promise<GuardResult> {
  const g = await requireRole(min);
  if (!g.ok) {
    return {
      error: NextResponse.json(
        { error: g.status === 403 ? "forbidden" : "unauthenticated", message: g.message },
        { status: g.status },
      ),
    };
  }
  return { tenant: g.tenant };
}

/** Gate an AI generation endpoint: authentication (when configured), role
 *  (editor+), abuse rate limit (per org), and plan quota for the metered
 *  resource. Returns the resolved tenant or a ready error response
 *  (401 / 403 / 429 / 402). */
export async function guardGeneration(kind: "words" | "images"): Promise<GuardResult> {
  const tenant = await getOptionalTenant();
  if (!tenant) {
    return {
      error: NextResponse.json(
        { error: "unauthenticated", message: "Please sign in to continue." },
        { status: 401 },
      ),
    };
  }

  // Viewers are read-only — generating content requires editor+.
  if (!canCreateContent(tenant.role)) {
    return {
      error: NextResponse.json(
        { error: "forbidden", message: "You need editor access or higher to generate content." },
        { status: 403 },
      ),
    };
  }

  // Abuse protection — caps AI calls per org per minute (protects cost/compute).
  const rl = await rateLimit(`ai:${tenant.orgId}`, { limit: AI_LIMIT_PER_MIN, windowSec: 60 });
  if (!rl.allowed) return { error: tooManyRequests(rl) };

  const quota = await checkQuota(tenant.orgId, tenant.plan, kind);
  if (!quota.allowed) {
    const planName = PLANS.find((p) => p.id === tenant.plan)?.name ?? tenant.plan;
    const resource = kind === "images" ? "visual generation" : "AI word";
    return {
      error: NextResponse.json(
        {
          error: "limit_reached",
          message: `You've reached your ${resource} limit on the ${planName} plan. Upgrade to keep creating.`,
          kind,
          used: quota.used,
          limit: quota.limit,
          plan: tenant.plan,
          upgradeUrl: "/dashboard/billing",
        },
        { status: 402 },
      ),
    };
  }

  return { tenant };
}

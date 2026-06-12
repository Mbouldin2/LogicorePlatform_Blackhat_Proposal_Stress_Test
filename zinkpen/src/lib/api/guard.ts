import "server-only";
import { NextResponse } from "next/server";
import { getOptionalTenant, type Tenant } from "@/lib/data/tenant";
import { checkQuota } from "@/lib/data/quota";
import { requireRole } from "@/lib/auth/guard";
import { canCreateContent, type Role } from "@/lib/auth/roles";
import { PLANS } from "@/lib/constants";

export type GuardResult = { tenant: Tenant } | { error: NextResponse };

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

/** Gate an AI generation endpoint: require authentication (when configured) and
 *  enforce the org's plan quota for the given metered resource. Returns either
 *  the resolved tenant or a ready-to-send error response (401 / 402). */
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

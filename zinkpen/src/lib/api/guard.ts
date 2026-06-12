import "server-only";
import { NextResponse } from "next/server";
import { getOptionalTenant, type Tenant } from "@/lib/data/tenant";
import { checkQuota } from "@/lib/data/quota";
import { PLANS } from "@/lib/constants";

export type GuardResult = { tenant: Tenant } | { error: NextResponse };

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

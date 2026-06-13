import "server-only";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getUsageSnapshot } from "./usage";
import { captureException } from "@/lib/logger";
import type { PlanId } from "@/lib/constants";

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  kind: "words" | "images";
}

/** Determine whether an org may run another generation of the given kind.
 *  Enforcement is only active when a real database is metering usage — demo
 *  mode (no DATABASE_URL) is always allowed so exploration is never blocked. */
export async function checkQuota(
  orgId: string,
  plan: PlanId,
  kind: "words" | "images",
): Promise<QuotaCheck> {
  try {
    const snap = await getUsageSnapshot(orgId, plan);
    const used = kind === "images" ? snap.imagesUsed : snap.wordsUsed;
    const limit = kind === "images" ? snap.imagesLimit : snap.wordsLimit;
    const allowed = !isDatabaseConfigured() || used < limit;
    return { allowed, used, limit, remaining: Math.max(0, limit - used), kind };
  } catch (err) {
    // Fail open — never block a generation because metering hiccupped.
    void captureException(err, { scope: "quota.checkQuota" });
    return { allowed: true, used: 0, limit: 0, remaining: 0, kind };
  }
}

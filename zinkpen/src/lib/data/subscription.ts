import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import type { PlanId } from "@/lib/constants";

/** Look up an org's Stripe customer id (for the billing portal). */
export async function getOrgStripeCustomerId(orgId: string): Promise<string | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripeCustomerId: true },
  });
  return org?.stripeCustomerId ?? null;
}

/** Persist a plan change for an org (called from the Stripe webhook). No-op in
 *  demo mode. Best-effort; never throws into the webhook handler. */
export async function setOrgPlan(
  orgId: string,
  plan: PlanId,
  stripe?: { customerId?: string; subscriptionId?: string },
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan,
        ...(stripe?.customerId ? { stripeCustomerId: stripe.customerId } : {}),
        ...(stripe?.subscriptionId ? { stripeSubscriptionId: stripe.subscriptionId } : {}),
      },
    });
  } catch (err) {
    console.error("[subscription] setOrgPlan failed:", err);
  }
}

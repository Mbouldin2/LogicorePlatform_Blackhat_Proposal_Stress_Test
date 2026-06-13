import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { apiRequireRole, enforceRateLimit } from "@/lib/api/guard";
import { getOrgStripeCustomerId } from "@/lib/data/subscription";

export const runtime = "nodejs";

/** Opens the Stripe Customer Portal for the current org, where users manage
 *  payment methods, invoices, and cancellation. Admin-only. Degrades to a demo
 *  message when Stripe isn't configured or the org has no Stripe customer yet. */
export async function POST() {
  const guard = await apiRequireRole("admin");
  if ("error" in guard) return guard.error;
  const tenant = guard.tenant;

  const limited = await enforceRateLimit(`stripe:${tenant.orgId}`, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!stripe) {
    return NextResponse.json({
      demo: true,
      message: "Billing portal is in demo mode. Configure STRIPE_SECRET_KEY to manage live subscriptions.",
    });
  }

  const customerId = await getOrgStripeCustomerId(tenant.orgId);
  if (!customerId) {
    return NextResponse.json({
      demo: true,
      message: "No active subscription yet. Choose a plan to start, then manage it here.",
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/billing`,
  });
  return NextResponse.json({ url: session.url });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, priceIdForPlan } from "@/lib/stripe/server";
import { apiRequireRole, enforceRateLimit } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["starter", "professional", "executive", "government"]),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  // Billing is admin-only.
  const guard = await apiRequireRole("admin");
  if ("error" in guard) return guard.error;
  const tenant = guard.tenant;

  const limited = await enforceRateLimit(`stripe:${tenant.orgId}`, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const stripe = getStripe();
  const priceId = priceIdForPlan(parsed.data.plan);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Demo mode — Stripe not configured. Return a friendly simulated response.
  if (!stripe || !priceId) {
    return NextResponse.json({
      demo: true,
      message:
        "Billing is in demo mode. Configure STRIPE_SECRET_KEY and the plan price IDs to enable live checkout.",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?status=success`,
    cancel_url: `${appUrl}/pricing?status=cancelled`,
    allow_promotion_codes: true,
    client_reference_id: tenant.orgId,
    customer_email: tenant.email,
    // Carried back to us on checkout.session.completed for plan sync.
    metadata: { orgId: tenant.orgId, plan: parsed.data.plan },
    subscription_data: { metadata: { orgId: tenant.orgId, plan: parsed.data.plan } },
  });

  return NextResponse.json({ url: session.url });
}

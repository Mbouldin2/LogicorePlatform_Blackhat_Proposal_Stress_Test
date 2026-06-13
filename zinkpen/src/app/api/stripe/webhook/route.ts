import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { setOrgPlan } from "@/lib/data/subscription";
import type { PlanId } from "@/lib/constants";

const PLAN_IDS: PlanId[] = ["starter", "professional", "executive", "government"];
function asPlan(v: unknown): PlanId | null {
  return typeof v === "string" && (PLAN_IDS as string[]).includes(v) ? (v as PlanId) : null;
}

export const runtime = "nodejs";

/** Stripe webhook — verifies the signature and routes subscription lifecycle
 *  events. In production, persist plan changes to the Organization model. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, demo: true });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const orgId = s.metadata?.orgId ?? s.client_reference_id ?? undefined;
      const plan = asPlan(s.metadata?.plan);
      if (orgId && plan) {
        await setOrgPlan(orgId, plan, {
          customerId: typeof s.customer === "string" ? s.customer : undefined,
          subscriptionId: typeof s.subscription === "string" ? s.subscription : undefined,
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      const plan = asPlan(sub.metadata?.plan);
      if (orgId && plan) {
        await setOrgPlan(orgId, plan, {
          customerId: typeof sub.customer === "string" ? sub.customer : undefined,
          subscriptionId: sub.id,
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      // Downgrade to Starter on cancellation.
      if (orgId) await setOrgPlan(orgId, "starter", { subscriptionId: sub.id });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

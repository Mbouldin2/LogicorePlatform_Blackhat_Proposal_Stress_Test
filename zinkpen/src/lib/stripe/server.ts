import "server-only";
import Stripe from "stripe";
import type { PlanId } from "@/lib/constants";

let _stripe: Stripe | null = null;

/** Lazily construct the Stripe client. Returns null when unconfigured so billing
 *  endpoints degrade to a clear demo response instead of crashing. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
  }
  return _stripe;
}

export function priceIdForPlan(plan: PlanId): string | undefined {
  const map: Record<PlanId, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    executive: process.env.STRIPE_PRICE_EXECUTIVE,
    government: process.env.STRIPE_PRICE_GOVERNMENT,
  };
  return map[plan];
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

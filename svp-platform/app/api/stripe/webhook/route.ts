import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY_TEST ?? process.env.STRIPE_SECRET_KEY ?? "",
    { apiVersion: "2026-01-28.clover" }
  );

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  console.log("[Stripe Webhook] Event:", event.type, event.id);

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("[Stripe Webhook] Payment succeeded:", (event.data.object as Stripe.PaymentIntent).id);
      break;
    case "payment_intent.payment_failed":
      console.log("[Stripe Webhook] Payment failed:", (event.data.object as Stripe.PaymentIntent).id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      console.log("[Stripe Webhook] Subscription event:", event.type);
      break;
    default:
      console.log("[Stripe Webhook] Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}

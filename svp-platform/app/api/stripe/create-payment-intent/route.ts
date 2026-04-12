import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripeClient(mode: "test" | "live"): Stripe | null {
  const key =
    mode === "live"
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST ?? process.env.STRIPE_SECRET_KEY;

  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "usd", description = "Test Payment", mode = "test" } = body;

    if (!amount || typeof amount !== "number" || amount < 50) {
      return NextResponse.json(
        { error: "Amount must be at least 50 cents (in cents)" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient(mode as "test" | "live");
    if (!stripe) {
      return NextResponse.json(
        { error: `Stripe ${mode} secret key not configured. Set STRIPE_SECRET_KEY_${mode.toUpperCase()} in your environment variables.` },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      automatic_payment_methods: { enabled: true },
      metadata: { mode, source: "svp-stripe-test" },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

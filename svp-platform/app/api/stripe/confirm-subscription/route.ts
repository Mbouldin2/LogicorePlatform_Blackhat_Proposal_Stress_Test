import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const {
      paymentMethodId,
      customerEmail,
      customerName,
      monthlyAmount,
      agreementName,
      signatureId,
    } = await request.json();

    if (!paymentMethodId || !customerEmail || !monthlyAmount || !signatureId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve the setup intent to get the customer ID
    const setupIntent = await stripe.setupIntents.retrieve(paymentMethodId as string);
    const customerId = setupIntent.customer as string;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId as string, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId as string,
      },
    });

    // Create product first
    const product = await stripe.products.create({
      name: `${agreementName} - Monthly Hosting Fee`,
    });

    // Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(monthlyAmount * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });

    // Create the subscription using the price ID
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      metadata: {
        signatureId,
        customerEmail,
        agreementName,
      },
    });

    // Update the signing request with subscription info
    if (adminDb) {
      try {
        const sigRef = adminDb.collection(COLLECTIONS.PROPOSAL_SIGNATURES).doc(signatureId);
        await sigRef.update({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePaymentMethodId: paymentMethodId,
          subscriptionStatus: "active",
          subscriptionCreatedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } catch (dbError) {
        console.error("Failed to update signing request with subscription:", dbError);
        // Don't fail the request if DB update fails
      }
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Error confirming subscription:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create subscription", details: message },
      { status: 500 }
    );
  }
}

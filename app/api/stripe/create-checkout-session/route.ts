import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail, stripeCustomerId } = await request.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let customerId = stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;

      const supabase = createServerClient();
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      client_reference_id: userId,
      subscription_data: {
        metadata: { userId },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
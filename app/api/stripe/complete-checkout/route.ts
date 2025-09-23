import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      console.error("Missing session ID");
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session.client_reference_id) {
      console.error("No client_reference_id in session:", session.id);
      return NextResponse.json({ error: "Invalid user ID in session" }, { status: 400 });
    }

    if (!session.customer || typeof session.customer !== "string") {
      console.error("Invalid customer data in session:", session.id);
      return NextResponse.json({ error: "Invalid customer data" }, { status: 400 });
    }

    const subscription = session.subscription as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price.id;
    const subscriptionTier = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOREST_GUARDIAN
      ? "Forest Guardian"
      : priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_JUNGLE_MASTER
      ? "Jungle Master"
      : null;

    if (!subscriptionTier) {
      console.error("Invalid price ID:", priceId);
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.client_reference_id)
      .single();

    if (fetchError || !profile) {
      console.error("User not found in profiles table:", session.client_reference_id, fetchError?.message);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const startDate = subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const endDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: subscriptionTier,
        subscription_status: "active",
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.client_reference_id);

    if (error) {
      console.error("Supabase update error:", error.message, error.details, error.hint);
      return NextResponse.json({ error: `Failed to update profile: ${error.message}` }, { status: 500 });
    }

    console.log(`Successfully updated profile for user ${session.client_reference_id} to ${subscriptionTier} (start: ${startDate}, end: ${endDate})`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error completing checkout:", error.message, error.stack);
    return NextResponse.json({ error: error.message || "Failed to complete checkout" }, { status: 500 });
  }
}

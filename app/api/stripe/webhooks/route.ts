import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) {
          await supabase
            .from("orders")
            .update({
              stripe_payment_id: session.payment_intent,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const subscriptionTier =
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOREST_GUARDIAN
            ? "Forest Guardian"
            : priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_JUNGLE_MASTER
            ? "Jungle Master"
            : "Seedling"

        const status =
          subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
            ? "past_due"
            : "cancelled"

        await supabase
          .from("profiles")
          .update({
            subscription_tier: subscriptionTier,
            subscription_status: status,
            subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: subscription.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer)
        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "Seedling",
            subscription_status: "cancelled",
            subscription_end_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer)
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 })
  }
}

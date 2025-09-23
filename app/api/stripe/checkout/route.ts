import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, orderId } = body

    // Validate required fields
    if (!email || !name || !orderId) {
      return NextResponse.json({ error: "Missing required fields: email, name, and orderId" }, { status: 400 })
    }

    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable")
      return NextResponse.json({ error: "Payment system configuration error" }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Digital Study Planner and Journal",
              description:
                "The ultimate study companion that combines planning and journaling in one beautiful, organized system.",
            },
            unit_amount: 200, // $2.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: {
        orderId: orderId,
        customerName: name,
      },
      success_url: `${request.nextUrl.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/shop?canceled=true`,
    })

    // Update order with Stripe payment intent ID
    const supabase = await createServerClient()
    await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe API error:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}

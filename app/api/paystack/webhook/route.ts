import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables")
}

const PLAN_TIER_MAPPING = {
  PLN_os0c04ttztct7ve: "Forest Guardian",
  PLN_4lanypztz0ktaj7: "Jungle Master",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY as string).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = createServerClient()

    switch (event.event) {
      case "charge.success":
        const { data } = event
        const userId =
          data.metadata?.userId ||
          data.metadata?.custom_fields?.find((field: any) => field.variable_name === "user_id")?.value
        const planCode = data.metadata?.planCode || data.plan?.plan_code

        if (userId && planCode) {
          const subscriptionTier = PLAN_TIER_MAPPING[planCode as keyof typeof PLAN_TIER_MAPPING]

          if (subscriptionTier) {
            // Update user subscription
            await supabase.from("profiles").upsert({
              id: userId,
              subscription_tier: subscriptionTier,
              subscription_status: "active",
              paystack_customer_code: data.customer?.customer_code,
              updated_at: new Date().toISOString(),
            })

            // Update auth metadata
            await supabase.auth.admin.updateUserById(userId, {
              user_metadata: {
                subscription_tier: subscriptionTier,
                subscription_status: "active",
              },
            })

            // Update transaction status
            await supabase
              .from("paystack_transactions")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
              })
              .eq("reference", data.reference)
          }
        }
        break

      case "subscription.disable":
      case "subscription.not_renew":
        // Handle subscription cancellation
        const cancelData = event.data
        const cancelUserId = cancelData.metadata?.userId

        if (cancelUserId) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", cancelUserId)

          await supabase.auth.admin.updateUserById(cancelUserId, {
            user_metadata: {
              subscription_status: "cancelled",
            },
          })
        }
        break

      default:
        console.log(`Unhandled Paystack webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Paystack webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

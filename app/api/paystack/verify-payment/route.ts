import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 })
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const { data } = paystackData
    const userId =
      data.metadata.userId ||
      data.metadata.custom_fields?.find((field: any) => field.variable_name === "user_id")?.value
    const planCode = data.metadata.planCode || data.plan?.plan_code

    if (!userId || !planCode) {
      return NextResponse.json({ error: "Missing user ID or plan code in transaction metadata" }, { status: 400 })
    }

    const subscriptionTier = PLAN_TIER_MAPPING[planCode as keyof typeof PLAN_TIER_MAPPING]

    if (!subscriptionTier) {
      return NextResponse.json({ error: "Invalid plan code" }, { status: 400 })
    }

    // Update user subscription in database
    const supabase = createServerClient()

    // Update user profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      subscription_tier: subscriptionTier,
      subscription_status: "active",
      paystack_customer_code: data.customer.customer_code,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      return NextResponse.json({ error: "Failed to update user subscription" }, { status: 500 })
    }

    // Update auth user metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_tier: subscriptionTier,
        subscription_status: "active",
      },
    })

    if (authError) {
      console.error("Error updating auth metadata:", authError)
    }

    // Update transaction status
    await supabase
      .from("paystack_transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("reference", reference)

    return NextResponse.json({
      success: true,
      subscription_tier: subscriptionTier,
      message: "Payment verified and subscription updated successfully",
    })
  } catch (error) {
    console.error("Error verifying Paystack payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables")
}

const PAYSTACK_PLAN_IDS = {
  "Forest Guardian": "PLN_os0c04ttztct7ve",
  "Jungle Master": "PLN_4lanypztz0ktaj7",
}

export async function POST(request: NextRequest) {
  try {
    const { planCode, userId, userEmail } = await request.json()

    if (!planCode || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields: planCode, userId, userEmail" }, { status: 400 })
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        plan: planCode,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/success`,
        metadata: {
          userId,
          planCode,
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: userId,
            },
          ],
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData)
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize Paystack transaction" },
        { status: 400 },
      )
    }

    // Store transaction reference in database for verification later
    const supabase = createServerClient()
    await supabase.from("paystack_transactions").insert({
      user_id: userId,
      reference: paystackData.data.reference,
      plan_code: planCode,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    })
  } catch (error) {
    console.error("Error creating Paystack checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, customer_email, product_name, amount, currency, status, created_at } = body

    // Validate required fields
    if (!customer_name || !customer_email || !product_name || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createServerClient()

    // Insert order into database
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name,
        customer_email,
        product_name,
        amount,
        currency,
        status: status || "pending",
        created_at: created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json({ orderId: data.id })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

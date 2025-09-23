import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server"
import crypto from "crypto"

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET

// Paddle Price IDs to your internal plan names
const PADDLE_PRICE_ID_TO_TIER: Record<string, "Forest Guardian" | "Jungle Master"> = {
  // Updated type
  pri_01jwg05p8gg4qdwjfra9mbpqxg: "Forest Guardian", // Updated value
  pri_01jwg092pdtnhta6pdt1hr4hp5: "Jungle Master", // Updated value
}

async function verifyPaddleSignature(request: NextRequest, rawBody: string) {
  if (!PADDLE_WEBHOOK_SECRET) {
    console.error("Paddle webhook secret is not configured.")
    return false
  }

  const signatureHeader = request.headers.get("paddle-signature")
  if (!signatureHeader) {
    console.warn("Missing paddle-signature header")
    return false
  }

  const [tsPart, h1Part] = signatureHeader.split(";")
  const timestamp = tsPart?.split("=")[1]
  const signature = h1Part?.split("=")[1]

  if (!timestamp || !signature) {
    console.warn("Invalid paddle-signature header format")
    return false
  }

  const signedPayload = `${timestamp}:${rawBody}`
  const expectedSignature = crypto.createHmac("sha256", PADDLE_WEBHOOK_SECRET).update(signedPayload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function POST(request: NextRequest) {
  let rawBody
  try {
    rawBody = await request.text()
  } catch (error) {
    console.error("Error reading request body:", error)
    return NextResponse.json({ error: "Error reading request body" }, { status: 400 })
  }

  const isValidSignature = await verifyPaddleSignature(request, rawBody)
  if (!isValidSignature) {
    console.warn("Invalid Paddle webhook signature.")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch (error) {
    console.error("Error parsing webhook JSON:", error)
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()
  const eventType = event.event_type
  const eventData = event.data

  console.log(`Received Paddle webhook: ${eventType}`, JSON.stringify(eventData, null, 2))

  try {
    switch (eventType) {
      case "transaction.completed":
      case "subscription.created":
      case "subscription.updated":
        const customerId = eventData.customer_id
        const subscriptionId = eventData.id // For subscription events, this is subscription_id
        // For transaction.completed, it's transaction_id, but items contain subscription_id

        let userId = eventData.custom_data?.user_id
        let userEmail = eventData.custom_data?.user_email

        if (!userId && customerId) {
          // Try to find user by paddle_customer_id if custom_data is not available (e.g. subscription.updated not from initial checkout)
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("paddle_customer_id", customerId)
            .single()
          if (profile) {
            userId = profile.id
            userEmail = profile.email
          } else {
            console.warn(`No profile found for paddle_customer_id: ${customerId}`)
            // Potentially create a new user or log this for manual handling if email is present in eventData.customer
          }
        }

        if (!userId) {
          console.error("User ID not found in webhook payload or profile lookup.")
          return NextResponse.json({ error: "User ID missing" }, { status: 400 })
        }

        // Determine the subscription tier
        let newTier: "Seedling" | "Forest Guardian" | "Jungle Master" = "Seedling" // Updated type and default
        let newStatus: "active" | "cancelled" | "expired" | "past_due" = "active"

        if (eventData.status === "active" || eventData.status === "trialing") {
          newStatus = "active"
          const priceId = eventData.items?.[0]?.price?.id
          if (priceId && PADDLE_PRICE_ID_TO_TIER[priceId]) {
            newTier = PADDLE_PRICE_ID_TO_TIER[priceId]!
          } else {
            console.warn(`Unknown price ID: ${priceId} for user ${userId}. Defaulting to Seedling or keeping existing.`)
            const { data: currentProfile } = await supabase
              .from("profiles")
              .select("subscription_tier")
              .eq("id", userId)
              .single()
            newTier = currentProfile?.subscription_tier || "Seedling" // Updated default
          }
        } else if (eventData.status === "canceled") {
          newStatus = "cancelled"
          newTier = "Seedling" // Downgrade to Seedling on cancellation
        } else if (eventData.status === "past_due") {
          newStatus = "past_due"
          const { data: currentProfile } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .single()
          newTier = currentProfile?.subscription_tier || "Seedling" // Keep current tier, or Seedling if none
        } else {
          // Other statuses like 'paused'
          newStatus = eventData.status as typeof newStatus // Type assertion
          const { data: currentProfile } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .single()
          newTier = currentProfile?.subscription_tier || "Seedling" // Updated default
        }

        // Update Supabase Auth user_metadata
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { subscription_tier: newTier, subscription_status: newStatus },
        })
        if (authUpdateError) {
          console.error(`Error updating auth metadata for user ${userId}:`, authUpdateError)
          // Continue to update profiles table anyway
        }

        // Update profiles table
        const { error: profileUpdateError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            email: userEmail, // Ensure email is also updated/set if available
            subscription_tier: newTier,
            subscription_status: newStatus,
            paddle_customer_id: customerId,
            paddle_subscription_id: eventType.startsWith("subscription.")
              ? eventData.id
              : eventData.subscription_id || eventData.items?.[0]?.subscription_id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )

        if (profileUpdateError) {
          console.error(`Error updating profile for user ${userId}:`, profileUpdateError)
          return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
        }

        console.log(`Successfully updated user ${userId} to tier ${newTier} with status ${newStatus}.`)
        break

      case "subscription.canceled":
        const canceledCustomerId = eventData.customer_id
        const canceledSubscriptionId = eventData.id

        let canceledUserId = eventData.custom_data?.user_id
        if (!canceledUserId && canceledCustomerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("paddle_customer_id", canceledCustomerId)
            .single()
          if (profile) canceledUserId = profile.id
        }

        if (!canceledUserId) {
          console.error("User ID not found for subscription.canceled event.")
          return NextResponse.json({ error: "User ID missing for cancellation" }, { status: 400 })
        }

        // Update user to 'Seedling' tier and 'cancelled' status
        const { error: authCancelError } = await supabase.auth.admin.updateUserById(canceledUserId, {
          user_metadata: { subscription_tier: "Seedling", subscription_status: "cancelled" }, // Updated
        })
        if (authCancelError)
          console.error(`Error updating auth metadata for user ${canceledUserId} (cancel):`, authCancelError)

        const { error: profileCancelError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "Seedling", // Updated
            subscription_status: "cancelled",
            // paddle_subscription_id: null, // Optionally clear this or keep for history
            updated_at: new Date().toISOString(),
          })
          .eq("id", canceledUserId)

        if (profileCancelError) {
          console.error(`Error updating profile for user ${canceledUserId} (cancel):`, profileCancelError)
          return NextResponse.json({ error: "Failed to update user profile on cancellation" }, { status: 500 })
        }
        console.log(`Successfully processed subscription cancellation for user ${canceledUserId}.`)
        break

      default:
        console.log(`Unhandled Paddle event type: ${eventType}`)
    }
  } catch (error: any) {
    console.error("Error processing Paddle webhook:", error)
    return NextResponse.json({ error: "Webhook processing error", details: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

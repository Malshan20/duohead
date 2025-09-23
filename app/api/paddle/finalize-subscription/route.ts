import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const PADDLE_API_KEY = process.env.PADDLE_API_KEY
const RAW_PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV || "production"
const PADDLE_ENV = RAW_PADDLE_ENV.trim().toLowerCase()

const PADDLE_API_BASE_URL = PADDLE_ENV === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const PADDLE_PRICE_ID_TO_TIER: Record<string, "Forest Guardian" | "Jungle Master"> = {
  pri_01jwg05p8gg4qdwjfra9mbpqxg: "Forest Guardian",
  pri_01jwg092pdtnhta6pdt1hr4hp5: "Jungle Master",
}

interface PaddleTransactionItem {
  price: { id: string }
  quantity: number
}

interface PaddleTransaction {
  id: string // This will be txn_...
  status: string
  items: PaddleTransactionItem[]
  customer_id: string
  subscription_id?: string
  custom_data?: { user_id: string; user_email: string }
  checkout?: { id?: string } // checkout.id might be che_...
}

interface PaddleListTransactionsResponse {
  data: PaddleTransaction[]
  // meta: ...
}

export async function POST(req: NextRequest) {
  console.log(`Finalize-subscription: PADDLE_ENV determined as: "${PADDLE_ENV}", Base URL: "${PADDLE_API_BASE_URL}"`)

  if (!PADDLE_API_KEY) {
    console.error("Finalize-subscription: PADDLE_API_KEY is not configured.")
    return NextResponse.json({ error: "Server configuration error: Missing Paddle API Key." }, { status: 500 })
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Finalize-subscription: Supabase URL or Service Role Key is not configured.")
    return NextResponse.json({ error: "Server configuration error: Missing Supabase credentials." }, { status: 500 })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { paddleEventData } = await req.json()

    if (!paddleEventData || !paddleEventData.id) {
      console.warn("Finalize-subscription: Missing paddleEventData or paddleEventData.id from client.")
      return NextResponse.json({ error: "Missing Paddle event data or ID from client" }, { status: 400 })
    }

    const receivedId = typeof paddleEventData.id === "string" ? paddleEventData.id.trim() : null

    if (!receivedId) {
      console.warn("Finalize-subscription: Received ID is null or not a string after trim:", paddleEventData.id)
      return NextResponse.json({ error: "Invalid or missing ID format from client." }, { status: 400 })
    }
    console.log(`Finalize-subscription: Received ID from client: "${receivedId}"`)

    let verifiedTransaction: PaddleTransaction | null = null
    let actualTransactionId: string | null = null

    if (receivedId.startsWith("che_")) {
      // Assume it's a Checkout ID, try to find the transaction via /transactions?checkout_id=...
      const checkoutId = receivedId
      const listTxnsUrl = `${PADDLE_API_BASE_URL}/transactions?checkout_id=${checkoutId}`
      console.log(
        `Finalize-subscription: Received Checkout ID "${checkoutId}". Fetching transactions from: ${listTxnsUrl}`,
      )

      const listResponse = await fetch(listTxnsUrl, {
        headers: { Authorization: `Bearer ${PADDLE_API_KEY}`, "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!listResponse.ok) {
        const errorBody = await listResponse.text()
        console.error(
          `Finalize-subscription: Paddle API error fetching transactions for checkout_id "${checkoutId}": ${listResponse.status} ${listResponse.statusText}`,
          errorBody,
        )
        return NextResponse.json(
          {
            error: `Failed to fetch transaction details using checkout ID: ${listResponse.status} ${listResponse.statusText}`,
          },
          { status: listResponse.status },
        )
      }

      const listResult: PaddleListTransactionsResponse = await listResponse.json()
      if (listResult.data && listResult.data.length > 0) {
        // Assuming the first completed/billed transaction is the relevant one.
        // You might need more sophisticated logic if multiple transactions can be associated.
        verifiedTransaction =
          listResult.data.find((txn) => txn.status === "completed" || txn.status === "billed") || listResult.data[0]

        if (!verifiedTransaction) {
          console.warn(
            `Finalize-subscription: No completed or billed transaction found for checkout_id "${checkoutId}". Found transactions:`,
            listResult.data.map((t) => ({ id: t.id, status: t.status })),
          )
          return NextResponse.json(
            { error: `No suitable transaction found for checkout ID ${checkoutId}` },
            { status: 404 },
          )
        }
        actualTransactionId = verifiedTransaction.id
        console.log(`Finalize-subscription: Found transaction "${actualTransactionId}" for checkout_id "${checkoutId}"`)
      } else {
        console.warn(`Finalize-subscription: No transactions found for checkout_id "${checkoutId}"`)
        return NextResponse.json({ error: `No transaction found for checkout ID ${checkoutId}` }, { status: 404 })
      }
    } else if (receivedId.startsWith("txn_")) {
      // Assume it's a Transaction ID, fetch it directly
      actualTransactionId = receivedId
      const getTxnUrl = `${PADDLE_API_BASE_URL}/transactions/${actualTransactionId}`
      console.log(
        `Finalize-subscription: Received Transaction ID "${actualTransactionId}". Fetching from: ${getTxnUrl}`,
      )

      const getResponse = await fetch(getTxnUrl, {
        headers: { Authorization: `Bearer ${PADDLE_API_KEY}`, "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!getResponse.ok) {
        const errorBody = await getResponse.text()
        console.error(
          `Finalize-subscription: Paddle API error fetching transaction "${actualTransactionId}": ${getResponse.status} ${getResponse.statusText}`,
          errorBody,
        )
        return NextResponse.json(
          { error: `Failed to verify transaction with Paddle: ${getResponse.status} ${getResponse.statusText}` },
          { status: getResponse.status },
        )
      }
      const getResult: { data: PaddleTransaction } = await getResponse.json()
      verifiedTransaction = getResult.data
    } else {
      console.warn(
        `Finalize-subscription: Invalid ID format received: "${receivedId}". Expected "che_..." or "txn_..."`,
      )
      return NextResponse.json({ error: `Invalid ID format: ${receivedId}` }, { status: 400 })
    }

    if (!verifiedTransaction || !actualTransactionId) {
      console.error("Finalize-subscription: Could not obtain verified transaction details.")
      return NextResponse.json({ error: "Failed to obtain transaction details from Paddle." }, { status: 500 })
    }

    if (!actualTransactionId.startsWith("txn_")) {
      console.error(`Finalize-subscription: Extracted transaction ID "${actualTransactionId}" is not a valid format.`)
      return NextResponse.json(
        { error: `Internal error: Invalid transaction ID resolved: ${actualTransactionId}` },
        { status: 500 },
      )
    }

    console.log(
      `Finalize-subscription: Processing verified transaction ID: "${actualTransactionId}", Status: "${verifiedTransaction.status}"`,
    )

    if (verifiedTransaction.status !== "completed" && verifiedTransaction.status !== "billed") {
      console.warn(
        `Finalize-subscription: Transaction "${actualTransactionId}" not completed. Status: "${verifiedTransaction.status}"`,
      )
      return NextResponse.json(
        { error: `Transaction not completed. Status: ${verifiedTransaction.status}` },
        { status: 400 },
      )
    }

    const clientPassedUserId = paddleEventData.custom_data?.user_id
    const userIdFromPaddleCustomData = verifiedTransaction.custom_data?.user_id

    if (!clientPassedUserId) {
      console.warn("Finalize-subscription: User ID not found in custom_data from client event (paddleEventData).")
      return NextResponse.json({ error: "User ID not found in custom data from client event." }, { status: 400 })
    }
    if (clientPassedUserId !== userIdFromPaddleCustomData) {
      console.error(
        `Finalize-subscription: User ID mismatch. Client (${clientPassedUserId}) vs Paddle Custom Data (${userIdFromPaddleCustomData}) for txn "${actualTransactionId}"`,
      )
      return NextResponse.json({ error: "User ID mismatch." }, { status: 400 })
    }
    if (!userIdFromPaddleCustomData) {
      console.error(
        `Finalize-subscription: User ID not found in Paddle transaction custom_data for txn "${actualTransactionId}"`,
      )
      return NextResponse.json({ error: "User ID missing in verified transaction data." }, { status: 400 })
    }

    const purchasedItem = verifiedTransaction.items[0]
    if (!purchasedItem || !purchasedItem.price || !purchasedItem.price.id) {
      console.error(`Finalize-subscription: Purchased item or price ID missing in txn "${actualTransactionId}"`)
      return NextResponse.json({ error: "Purchased item or price ID missing in transaction" }, { status: 400 })
    }
    const priceId = purchasedItem.price.id
    const newTier = PADDLE_PRICE_ID_TO_TIER[priceId]

    if (!newTier) {
      console.error(`Finalize-subscription: Unknown Price ID "${priceId}" for txn "${actualTransactionId}"`)
      return NextResponse.json({ error: `Unknown price ID: ${priceId}` }, { status: 400 })
    }

    const paddleCustomerId = verifiedTransaction.customer_id
    const paddleSubscriptionId = verifiedTransaction.subscription_id

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: newTier,
        subscription_status: "active",
        paddle_customer_id: paddleCustomerId,
        paddle_subscription_id: paddleSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userIdFromPaddleCustomData)

    if (profileError) {
      console.error(
        `Finalize-subscription: Supabase profile update error for user "${userIdFromPaddleCustomData}", txn "${actualTransactionId}":`,
        profileError,
      )
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }
    console.log(
      `Finalize-subscription: Successfully updated profile for user "${userIdFromPaddleCustomData}", new tier "${newTier}"`,
    )

    const {
      data: { user: authUser },
      error: getUserError,
    } = await supabaseAdmin.auth.admin.getUserById(userIdFromPaddleCustomData)
    if (getUserError || !authUser) {
      console.warn(
        `Finalize-subscription: Failed to get user "${userIdFromPaddleCustomData}" for auth metadata update (txn "${actualTransactionId}"):`,
        getUserError,
      )
    } else {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userIdFromPaddleCustomData, {
        user_metadata: {
          ...authUser.user_metadata,
          subscription_tier: newTier,
          subscription_status: "active",
          paddle_customer_id: paddleCustomerId,
          paddle_subscription_id: paddleSubscriptionId,
        },
      })
      if (authError) {
        console.warn(
          `Finalize-subscription: Supabase auth metadata update error for user "${userIdFromPaddleCustomData}" (txn "${actualTransactionId}"):`,
          authError,
        )
      } else {
        console.log(
          `Finalize-subscription: Successfully updated auth metadata for user "${userIdFromPaddleCustomData}"`,
        )
      }
    }

    return NextResponse.json({ success: true, newTier: newTier, message: "Subscription updated successfully" })
  } catch (error: any) {
    console.error("Finalize-subscription: Unhandled error in POST handler:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

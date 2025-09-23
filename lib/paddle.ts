import { Paddle, Environment } from "@paddle/paddle-node-sdk"

const PADDLE_API_KEY = process.env.PADDLE_API_KEY
// Ensure this variable name matches what you've set in Vercel
const PADDLE_SANDBOX_ENV_STRING = process.env.NEXT_PUBLIC_PADDLE_SANDBOX

if (!PADDLE_API_KEY) {
  // This error should no longer occur if the variable is set
  throw new Error("PADDLE_API_KEY is not set in environment variables.")
}

// Convert string "true" or "false" to boolean
const isSandbox = PADDLE_SANDBOX_ENV_STRING === "true"
const environment = isSandbox ? Environment.sandbox : Environment.production

console.log(`Paddle SDK Initializing. Sandbox mode: ${isSandbox}`)

export const paddle = new Paddle(PADDLE_API_KEY, {
  environment,
})

export const PADDLE_PRICE_IDS = {
  FOREST_GUARDIAN: "pri_01jtt162w6ekf4pdrv520hn2gt",
  JUNGLE_MASTER: "pri_01jwbjzscsb3abpxn7t5xfdxzr",
}

// Maps Paddle Price IDs to your internal subscription tier names
export const PADDLE_PRICE_ID_TO_TIER_MAP: Record<string, "forest-guardian" | "jungle-master"> = {
  [PADDLE_PRICE_IDS.FOREST_GUARDIAN]: "forest-guardian",
  [PADDLE_PRICE_IDS.JUNGLE_MASTER]: "jungle-master",
}

// Maps your internal subscription tier names to Paddle Price IDs (useful for some operations)
export const PADDLE_TIER_TO_PRICE_ID_MAP: Record<"forest-guardian" | "jungle-master", string> = {
  "forest-guardian": PADDLE_PRICE_IDS.FOREST_GUARDIAN,
  "jungle-master": PADDLE_PRICE_IDS.JUNGLE_MASTER,
}

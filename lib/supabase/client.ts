import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

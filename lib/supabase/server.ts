import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Standard client for Server Components and Route Handlers using cookies
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Admin client for operations requiring service_role key (e.g., webhooks)
let supabaseAdmin: SupabaseClient | null = null

export function createServiceRoleSupabaseClient(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL or Service Role Key is not defined in environment variables.")
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdmin
}

// Renaming the old function to avoid confusion, or you can remove it if not used elsewhere
export function createServerClient() {
  return createServerSupabaseClient()
}

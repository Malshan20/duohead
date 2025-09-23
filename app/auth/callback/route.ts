import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_callback_error`)
      }

      if (data.user) {
        // Check if profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
            email: data.user.email || "",
            subscription_tier: "Seedling",
            subscription_status: "active",
          })

          if (insertError) {
            console.error("Profile creation error:", insertError)
          }
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error("Unexpected auth error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`)
}

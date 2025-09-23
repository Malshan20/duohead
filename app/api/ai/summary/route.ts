import { type NextRequest, NextResponse } from "next/server"
import { generateSummary } from "@/lib/groq"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Summary API called")

    // Verify user authentication
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { content } = body

    if (!content) {
      console.log("No content provided")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("Generating summary for content length:", content.length)
    const summary = await generateSummary(content)
    console.log("Summary generated successfully")

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summary API error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

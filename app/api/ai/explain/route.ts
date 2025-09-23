import { type NextRequest, NextResponse } from "next/server"
import { explainConcept } from "@/lib/groq"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { concept, documentContent } = await request.json()

    if (!concept || !documentContent) {
      return NextResponse.json({ error: "Concept and document content are required" }, { status: 400 })
    }

    const explanation = await explainConcept(concept, documentContent)

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error("Explain API error:", error)
    return NextResponse.json({ error: "Failed to explain concept" }, { status: 500 })
  }
}

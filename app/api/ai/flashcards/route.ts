import { type NextRequest, NextResponse } from "next/server"
import { generateFlashcards } from "@/lib/groq"
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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const flashcards = await generateFlashcards(content)

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error("Flashcards API error:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}

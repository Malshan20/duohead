import { type NextRequest, NextResponse } from "next/server"
import { generateStudyPlan } from "@/lib/groq"
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

    const { subject, examDate, currentLevel, startDate } = await request.json()

    if (!subject || !examDate) {
      return NextResponse.json({ error: "Subject and exam date are required" }, { status: 400 })
    }

    const studyPlan = await generateStudyPlan(subject, examDate, currentLevel || "intermediate")

    return NextResponse.json({ studyPlan })
  } catch (error) {
    console.error("Study plan API error:", error)
    return NextResponse.json({ error: "Failed to generate study plan" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Save Quiz Result API Started ===")

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quiz_title, score, total_points, time_taken, answers, subject_id } = await request.json()

    console.log("Saving quiz result:", {
      user_id: user.id,
      quiz_title,
      score,
      total_points,
      time_taken,
      subject_id,
    })

    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        user_id: user.id,
        quiz_title,
        score,
        total_points,
        time_taken,
        answers,
        subject_id,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save result" }, { status: 500 })
    }

    console.log("Quiz result saved successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving quiz result:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

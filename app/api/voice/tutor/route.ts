import { type NextRequest, NextResponse } from "next/server"
 // Use server client for route handlers
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { CoreMessage } from "ai"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { message, subject, difficulty, sessionHistory } = await request.json()

    // Use server-side Supabase client in Route Handlers
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth Error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's materials for context
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select("title, content, subject")
      .eq("user_id", user.id)
      .limit(5)

    if (materialsError) {
      console.error("Error fetching materials:", materialsError)
      // Continue without materials if there's an error, or handle as critical
    }

    const materialsContext =
      materials
        ?.map((m) => `Subject: ${m.subject}\nTitle: ${m.title}\nContent: ${m.content?.substring(0, 300)}...`) // Reduced substring length for brevity
        .join("\n\n") || "No specific materials context available."

    const systemPrompt = `You are Rachelle, an expert AI voice tutor specializing in active recall learning techniques. Your role is to help students practice and reinforce their knowledge through interactive voice conversations.

Key Guidelines:
- Use active recall techniques: ask questions before providing answers.
- Adapt to the student's ${difficulty || "intermediate"} level.
- Focus on ${subject && subject !== "any" ? subject : "general knowledge"} topics when specified.
- Keep responses conversational, encouraging, and concise (under 100 words ideally for voice).
- Ask follow-up questions to deepen understanding.
- Provide hints before giving direct answers.
- If the user's query seems unrelated to studying or the chosen subject, gently guide them back.
- You are having a voice conversation, so be natural and engaging.

Student's Materials Context (if relevant to the query):
${materialsContext}
`

    const conversationMessages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      ...(sessionHistory?.map((h: any) => ({
        // Ensure sessionHistory messages are correctly typed
        role: h.role as "user" | "assistant",
        content: h.content as string,
      })) || []),
      { role: "user", content: message },
    ]

    // Keep only the last N messages to avoid overly long context for the API
    const maxHistoryLength = 10 // System + last 9 user/assistant messages
    const trimmedMessages =
      conversationMessages.length > maxHistoryLength
        ? [conversationMessages[0], ...conversationMessages.slice(-maxHistoryLength + 1)]
        : conversationMessages

    const {
      text: aiResponse,
      finishReason,
      usage,
    } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      messages: trimmedMessages,
      temperature: 0.7,
      maxTokens: 200, // Reduced maxTokens for voice
    })

    console.log("Groq API Usage:", usage)
    console.log("Groq Finish Reason:", finishReason)

    if (!aiResponse) {
      console.error("Groq API returned empty response")
      return NextResponse.json({ error: "AI failed to generate a response." }, { status: 500 })
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("Voice Tutor Error:", error)
    // Check for specific error types if possible
    if (error.name === "APIError") {
      console.error("Groq API Error Details:", error.message, error.status, error.cause)
      return NextResponse.json({ error: `Groq API Error: ${error.message}` }, { status: error.status || 500 })
    }
    return NextResponse.json({ error: "Failed to get tutor response. " + (error.message || "") }, { status: 500 })
  }
}

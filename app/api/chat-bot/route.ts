import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Ellie, a friendly AI assistant for Duoheads, an AI-powered learning platform. 

Key information about Duoheads:
- AI-powered study tools including flashcards, summaries, voice tutoring
- Three pricing plans: Seedling (free), Forest Guardian ($9.99/month), Jungle Master ($34.99/semester)
- Features: document upload, AI summaries, flashcards, quiz generation, study planner, voice AI tutor, stress relief
- Free plan includes 10 document uploads, 2000 character summaries, 20 flashcards, 2 mins voice tutor daily
- Forest Guardian includes 50 uploads, unlimited flashcards, 30 mins voice tutor daily
- Jungle Master includes unlimited uploads, 60 mins voice tutor daily, 4-month access

Keep responses concise, friendly, and helpful. Use emojis occasionally. If asked about complex technical issues, human support, billing problems, or anything requiring personal assistance, suggest they talk to a human by saying something like "Let me connect you with our human support team for personalized help!"

If the user asks for human support or wants to talk to a human, respond with: "I'd love to connect you with our human support team! They're amazing at helping with detailed questions. Just let me know your name and email, and they'll get back to you soon! 😊"`,
      prompt: message,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Groq API error:", error)
    return NextResponse.json(
      {
        error:
          "I'm having trouble connecting right now. Would you like to speak with our human support team instead? 🤔",
      },
      { status: 500 },
    )
  }
}

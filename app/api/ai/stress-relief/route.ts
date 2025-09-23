import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("Stress relief request:", message)

    // Check if we have the API key
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error("GROQ_API_KEY not found")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    // Make direct API call to Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a compassionate AI wellness coach specializing in stress relief for students. Your responses should be:
            - Warm, empathetic, and supportive
            - Practical with actionable advice
            - Encouraging and positive
            - Brief but meaningful (2-3 sentences)
            - Include relevant emojis to create a calming atmosphere
            
            Focus on:
            - Breathing techniques
            - Mindfulness practices
            - Study-life balance
            - Positive affirmations
            - Gentle motivation
            - Stress management techniques
            
            Always maintain a caring, non-judgmental tone that helps students feel heard and supported.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq API error:", response.status, errorText)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    console.log("AI response generated successfully")
    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Stress relief API error:", error)

    // Fallback response
    const fallbackResponse =
      "I'm here to support you, though I'm having some technical difficulties right now. Remember to take deep breaths and be kind to yourself. You're stronger than you think! 🌸"

    return NextResponse.json({ response: fallbackResponse })
  }
}

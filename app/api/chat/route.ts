import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are a helpful AI tutor assistant. You help students understand concepts, answer questions, and provide study guidance. Be encouraging, clear, and educational in your responses. ${context ? `Context: ${context}` : ""}`,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Error processing chat request", { status: 500 })
  }
}

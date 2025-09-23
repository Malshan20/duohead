import { NextResponse } from "next/server"
import { generateSummary } from "@/lib/groq"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { text, type } = body

    if (!text || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if text is too long (optional limit)
    if (text.length > 50000) {
      return NextResponse.json({ error: "Text too long. Please limit to 50,000 characters." }, { status: 400 })
    }

    // Create prompt based on summary type
    let prompt = ""

    switch (type) {
      case "bullet":
        prompt = `Summarize the following text in a bullet point format. Focus on the key points and main ideas. Use bullet points (•) for each point. Be concise but comprehensive.

Text to summarize:
${text}

Bullet point summary:`
        break

      case "detailed":
        prompt = `Provide a detailed summary of the following text. Maintain the context and important details while condensing the information. The summary should be comprehensive but more concise than the original.

Text to summarize:
${text}

Detailed summary:`
        break

      case "eli5":
        prompt = `Explain the following text as if you're explaining to a 5-year-old. Use simple language, analogies, and examples that a child could understand. Avoid complex terminology.

Text to explain:
${text}

Explanation for a 5-year-old:`
        break

      case "study":
        prompt = `Create structured study notes from the following text. Include main topics, subtopics, key concepts, definitions, and important points to remember. Format it in a way that's easy to study from.

Text to convert to study notes:
${text}

Study notes:`
        break

      default:
        prompt = `Summarize the following text concisely while preserving the key information:

${text}

Summary:`
    }

    // Generate summary using the groq function
    const summary = await generateSummary(prompt)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarization error:", error)

    // Provide a fallback response if AI fails
    const fallbackSummary = `Unable to generate AI summary at the moment. Here's a basic analysis of your text:

Text length: ${text.length} characters
Word count: ~${text.split(/\s+/).length} words
Reading time: ~${Math.ceil(text.split(/\s+/).length / 200)} minutes

Please try again later or contact support if the issue persists.`

    return NextResponse.json({
      summary: fallbackSummary,
      fallback: true,
    })
  }
}

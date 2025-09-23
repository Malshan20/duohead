import { type NextRequest, NextResponse } from "next/server"

// Mock flashcards for when AI is unavailable
const fallbackFlashcards = [
  {
    question: "What are the main topics covered in this content?",
    answer: "The content covers several important concepts that are worth studying and understanding in detail.",
  },
  {
    question: "What key information should be remembered from this text?",
    answer:
      "The text contains essential information that forms the foundation for further learning in this subject area.",
  },
  {
    question: "How can this information be applied?",
    answer:
      "This knowledge can be applied in practical situations and serves as a building block for more advanced concepts.",
  },
  {
    question: "What are the fundamental principles discussed?",
    answer: "The material outlines several fundamental principles that are crucial for mastering this subject.",
  },
]

export async function POST(request: NextRequest) {
  let body
  try {
    // Parse request body safely
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format. Please provide valid JSON.",
          flashcards: fallbackFlashcards,
          note: "Could not parse your request. Here are some generic flashcards.",
        },
        { status: 200 },
      )
    }

    const { content } = body

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        {
          error: "Content is required and must be a string.",
          flashcards: fallbackFlashcards,
          note: "Please provide valid content. Here are some generic flashcards.",
        },
        { status: 200 },
      )
    }

    if (content.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Please provide at least 50 characters of content to generate meaningful flashcards.",
          flashcards: fallbackFlashcards,
          note: "Text was too short. Here are some generic flashcards.",
        },
        { status: 200 },
      )
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "AI service configuration error",
          flashcards: fallbackFlashcards,
          note: "AI service temporarily unavailable. Here are some basic flashcards to get you started.",
        },
        { status: 200 },
      )
    }

    // Try to use real AI generation
    try {
      const { generateText } = await import("ai")
      const { createGroq } = await import("@ai-sdk/groq")

      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      })

      console.log("Attempting AI flashcard generation...")

      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: `You are an AI tutor that creates effective flashcards for studying. Generate 4-6 flashcards based on the content provided. 

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format:
[
  {
    "question": "What is photosynthesis?",
    "answer": "The process by which plants convert sunlight into energy"
  },
  {
    "question": "What are the main components needed for photosynthesis?",
    "answer": "Sunlight, carbon dioxide, water, and chlorophyll"
  }
]

Rules:
- Return ONLY the JSON array, no additional text
- Each question should be clear and specific
- Each answer should be concise but complete
- Focus on key concepts, definitions, and important facts
- Generate 4-6 flashcards maximum`,
        prompt: `Create flashcards from this content (limit to most important concepts):\n\n${content.substring(0, 3000)}`,
        temperature: 0.3,
        maxTokens: 1500,
      })

      console.log("AI response received:", text.substring(0, 200) + "...")

      // Clean the response to ensure it's valid JSON
      let cleanedText = text.trim()

      // Remove any text before the first [
      const firstBracket = cleanedText.indexOf("[")
      if (firstBracket > 0) {
        cleanedText = cleanedText.substring(firstBracket)
      }

      // Remove any text after the last ]
      const lastBracket = cleanedText.lastIndexOf("]")
      if (lastBracket < cleanedText.length - 1) {
        cleanedText = cleanedText.substring(0, lastBracket + 1)
      }

      try {
        const flashcards = JSON.parse(cleanedText)

        // Validate the structure
        if (!Array.isArray(flashcards)) {
          throw new Error("Response is not an array")
        }

        // Validate each flashcard has required fields
        const validFlashcards = flashcards
          .filter(
            (card) =>
              card &&
              typeof card === "object" &&
              typeof card.question === "string" &&
              typeof card.answer === "string" &&
              card.question.trim().length > 0 &&
              card.answer.trim().length > 0,
          )
          .slice(0, 6) // Limit to 6 cards max
          .map((card) => ({
            question: card.question.trim(),
            answer: card.answer.trim(),
          }))

        if (validFlashcards.length === 0) {
          throw new Error("No valid flashcards found in response")
        }

        console.log(`Successfully generated ${validFlashcards.length} AI flashcards`)

        return NextResponse.json({
          flashcards: validFlashcards,
          success: true,
          note: "🤖 AI-generated flashcards created from your content!",
        })
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Cleaned text:", cleanedText)

        // Return fallback flashcards if JSON parsing fails
        const smartFallback = createSmartFallback(content)
        return NextResponse.json(
          {
            error: "AI response parsing failed",
            flashcards: smartFallback,
            note: "AI generated content but formatting failed. Here are smart flashcards based on your text.",
          },
          { status: 200 },
        )
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Create smart fallback based on content analysis
      const smartFallback = createSmartFallback(content)
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable",
          flashcards: smartFallback,
          note: "AI service is busy. Here are smart flashcards generated from your content analysis.",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Demo flashcards API error:", error)

    // Always return JSON with status 200 to avoid client-side errors
    const smartFallback = createSmartFallback(body?.content || "")
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        flashcards: smartFallback,
        note: "An error occurred during generation. Here are smart flashcards based on your content.",
        success: true, // Still mark as success so the client can display the cards
      },
      { status: 200 },
    )
  }
}

// Smart fallback function that analyzes content
function createSmartFallback(content: string) {
  if (!content || content.length < 10) {
    return fallbackFlashcards
  }

  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 30)

  // Extract potential topics/concepts (words that appear multiple times or are capitalized)
  const words = content.split(/\s+/)
  const wordFrequency = words.reduce(
    (acc, word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (cleanWord.length > 4) {
        acc[cleanWord] = (acc[cleanWord] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Find common words (potential topics)
  const commonWords = Object.entries(wordFrequency)
    .filter(([_, count]) => count > 1)
    .map(([word]) => word)
    .slice(0, 10)

  // Generate flashcards
  const generatedCards = []

  // Add concept-based cards
  if (commonWords.length > 0) {
    for (let i = 0; i < Math.min(commonWords.length, 2); i++) {
      generatedCards.push({
        question: `What is the significance of "${commonWords[i]}" in this context?`,
        answer: `${commonWords[i]} is a key concept discussed in the text that relates to the main themes and ideas presented.`,
      })
    }
  }

  // Add sentence-based cards
  if (sentences.length > 0) {
    for (let i = 0; i < Math.min(sentences.length, 2); i++) {
      const sentence = sentences[i].trim()
      if (sentence.length > 20) {
        generatedCards.push({
          question: `Explain the concept: "${sentence.substring(0, 50)}${sentence.length > 50 ? "..." : ""}"`,
          answer: `This concept relates to important principles discussed in the text and helps build understanding of the subject matter.`,
        })
      }
    }
  }

  // Add paragraph-based cards
  if (paragraphs.length > 0) {
    for (let i = 0; i < Math.min(paragraphs.length, 2); i++) {
      const paragraph = paragraphs[i].trim()
      const firstSentence = paragraph.split(/[.!?]/)[0].trim()
      if (firstSentence.length > 10) {
        generatedCards.push({
          question: `What does this statement mean: "${firstSentence.substring(0, 50)}${firstSentence.length > 50 ? "..." : ""}"?`,
          answer: `This statement establishes important information that forms the foundation for understanding the broader concepts in the text.`,
        })
      }
    }
  }

  // Ensure we have at least 3 cards
  if (generatedCards.length < 3) {
    const neededCards = 3 - generatedCards.length
    for (let i = 0; i < neededCards; i++) {
      generatedCards.push(fallbackFlashcards[i % fallbackFlashcards.length])
    }
  }

  return generatedCards.slice(0, 6) // Limit to 6 cards
}

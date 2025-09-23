// Remove the direct client-side usage and keep only server-side functions
// The client will call API routes instead

import { createGroq } from "@ai-sdk/groq"
import { generateText, streamText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Server-side functions only
export async function generateSummary(content: string): Promise<string> {
  try {
    console.log("Starting summary generation...")

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set")
    }

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system:
        "You are an AI tutor that creates concise, student-friendly summaries. Focus on key concepts, important definitions, and main ideas. Use bullet points and clear structure.",
      prompt: `Please create a comprehensive summary of this content:\n\n${content.substring(0, 4000)}`, // Limit content length
      temperature: 0.3,
      maxTokens: 1000,
    })

    console.log("Summary generated successfully")
    return text
  } catch (error) {
    console.error("Error in generateSummary:", error)
    if (error instanceof Error) {
      throw new Error(`Summary generation failed: ${error.message}`)
    }
    throw new Error("Failed to generate summary due to unknown error")
  }
}

export async function generateFlashcards(content: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are an AI tutor that creates effective flashcards for studying. Generate 5-10 flashcards based on the content. 

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

Do not include any text before or after the JSON array. Focus on key concepts, definitions, and important facts. Each question should be clear and specific, and each answer should be concise but complete.`,
      prompt: `Create flashcards from this content:\n\n${content.substring(0, 3000)}`,
      temperature: 0.3,
      maxTokens: 1500,
    })

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
      const validFlashcards = flashcards.filter(
        (card) =>
          card &&
          typeof card === "object" &&
          typeof card.question === "string" &&
          typeof card.answer === "string" &&
          card.question.trim() !== "" &&
          card.answer.trim() !== "",
      )

      if (validFlashcards.length === 0) {
        throw new Error("No valid flashcards found in response")
      }

      return validFlashcards
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Cleaned text:", cleanedText)

      // Return fallback flashcards if JSON parsing fails
      return [
        {
          question: "What is the main topic of this content?",
          answer: "Based on the provided material, this covers key concepts that require further study and review.",
        },
        {
          question: "What are the key points to remember?",
          answer:
            "The important concepts and definitions from the study material that need to be understood and memorized.",
        },
        {
          question: "How can this information be applied?",
          answer: "This knowledge can be used to understand related concepts and solve problems in this subject area.",
        },
      ]
    }
  } catch (error) {
    console.error("Error generating flashcards:", error)

    // Return fallback flashcards
    return [
      {
        question: "What should I study from this material?",
        answer: "Review the key concepts, definitions, and important points from the provided content.",
      },
      {
        question: "What are the main learning objectives?",
        answer: "Focus on understanding the core principles and how they relate to the broader subject matter.",
      },
    ]
  }
}

export async function generateQuiz(
  content: string,
  questionCount = 5,
): Promise<
  Array<{
    question: string
    options: string[]
    correct_answer: number
    explanation: string
  }>
> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are an AI tutor that creates multiple-choice quizzes. Generate exactly ${questionCount} questions based on the content. Return only a JSON array of objects with 'question', 'options' (array of 4 choices), 'correct_answer' (index 0-3), and 'explanation' fields.`,
      prompt: `Create a ${questionCount}-question quiz from this content:\n\n${content}`,
      temperature: 0.3,
      maxTokens: 2000,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating quiz:", error)
    return []
  }
}

export async function generateStudyPlan(
  subject: string,
  examDate: string,
  currentLevel: string,
): Promise<{
  title: string
  description: string
  goals: Array<{
    title: string
    description: string
    estimatedHours: number
    priority: string
  }>
}> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are an AI study planner that creates comprehensive study plans. You MUST respond with ONLY valid JSON in this exact format:

{
  "title": "Study Plan Title",
  "description": "Brief description of the study plan",
  "goals": [
    {
      "title": "Goal title",
      "description": "Goal description",
      "estimatedHours": 2,
      "priority": "high"
    }
  ]
}

Priority must be one of: "low", "medium", "high"
EstimatedHours must be a number between 1-8
Create 5-8 goals that are specific and actionable.
Do not include any text before or after the JSON.`,
      prompt: `Create a study plan for:
Subject: ${subject}
Exam Date: ${examDate}
Current Level: ${currentLevel}

Return ONLY the JSON object, no additional text.`,
      temperature: 0.3,
      maxTokens: 1500,
    })

    // Clean the response to ensure it's valid JSON
    let cleanedText = text.trim()

    // Remove any text before the first {
    const firstBrace = cleanedText.indexOf("{")
    if (firstBrace > 0) {
      cleanedText = cleanedText.substring(firstBrace)
    }

    // Remove any text after the last }
    const lastBrace = cleanedText.lastIndexOf("}")
    if (lastBrace < cleanedText.length - 1) {
      cleanedText = cleanedText.substring(0, lastBrace + 1)
    }

    try {
      return JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Cleaned text:", cleanedText)

      // Return a fallback study plan if JSON parsing fails
      return {
        title: `${subject} Study Plan`,
        description: "A comprehensive study plan for your exam preparation.",
        goals: [
          {
            title: "Review course materials",
            description: "Go through all textbooks, notes, and lecture materials",
            estimatedHours: 3,
            priority: "high",
          },
          {
            title: "Create summary notes",
            description: "Condense key concepts into study notes",
            estimatedHours: 2,
            priority: "medium",
          },
          {
            title: "Practice problems",
            description: "Work through practice exercises and past exams",
            estimatedHours: 4,
            priority: "high",
          },
          {
            title: "Review weak areas",
            description: "Focus on topics that need more attention",
            estimatedHours: 2,
            priority: "medium",
          },
          {
            title: "Final review",
            description: "Comprehensive review before the exam",
            estimatedHours: 3,
            priority: "high",
          },
        ],
      }
    }
  } catch (error) {
    console.error("Error generating study plan:", error)

    // Return a fallback study plan
    return {
      title: `${subject} Study Plan`,
      description: "A personalized study plan for your exam preparation.",
      goals: [
        {
          title: "Initial assessment",
          description: "Review syllabus and identify key topics",
          estimatedHours: 1,
          priority: "high",
        },
        {
          title: "Content review",
          description: "Study core concepts and materials",
          estimatedHours: 4,
          priority: "high",
        },
        {
          title: "Practice and application",
          description: "Work on practice problems and exercises",
          estimatedHours: 3,
          priority: "medium",
        },
        {
          title: "Weak area focus",
          description: "Address challenging topics",
          estimatedHours: 2,
          priority: "high",
        },
        {
          title: "Final preparation",
          description: "Last-minute review and exam prep",
          estimatedHours: 2,
          priority: "high",
        },
      ],
    }
  }
}

// New AI chat function for interactive tutoring
export async function* streamTutorResponse(message: string, context?: string) {
  try {
    const { textStream } = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are a helpful AI tutor assistant. You help students understand concepts, answer questions, and provide study guidance. Be encouraging, clear, and educational in your responses. ${context ? `Context: ${context}` : ""}`,
      prompt: message,
      temperature: 0.7,
      maxTokens: 1000,
    })

    for await (const delta of textStream) {
      yield delta
    }
  } catch (error) {
    console.error("Error in tutor response:", error)
    yield "I'm sorry, I'm having trouble responding right now. Please try again."
  }
}

// Function to explain concepts from documents
export async function explainConcept(concept: string, documentContent: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system:
        "You are an AI tutor that explains concepts clearly and simply. Use examples and analogies when helpful. Break down complex ideas into understandable parts.",
      prompt: `Based on this document content, please explain the concept of "${concept}" in simple terms:

Document Content:
${documentContent}

Please provide a clear, student-friendly explanation of "${concept}".`,
      temperature: 0.4,
      maxTokens: 800,
    })

    return text
  } catch (error) {
    console.error("Error explaining concept:", error)
    throw new Error("Failed to explain concept")
  }
}

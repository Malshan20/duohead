import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { checkSubscriptionLimits, updateMonthlyUsage } from "@/lib/subscription-limits"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Quiz Generation API Started ===")

    // Initialize Supabase client with cookies for authentication
    const supabase = createServerComponentClient({ cookies })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Parse request data
    let requestData
    try {
      requestData = await request.json()
      console.log("Request parsed successfully:", {
        hasContent: !!requestData.content,
        contentLength: requestData.content?.length || 0,
        questionCount: requestData.questionCount,
        difficulty: requestData.difficulty,
        quizType: requestData.quizType,
      })
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const {
      content,
      questionCount = 5,
      difficulty = "medium",
      quizType = "mixed",
      timeLimit = 30,
      subjectId,
      title,
      documentId, // New field for document-based quizzes
    } = requestData

    // Check subscription limits
    try {
      const canUse = await checkSubscriptionLimits(user.id, "quiz_generations")
      if (!canUse) {
        return NextResponse.json(
          { error: "You've reached your monthly quiz generation limit. Please upgrade your plan." },
          { status: 429 },
        )
      }
    } catch (limitError) {
      console.error("Error checking subscription limits:", limitError)
      // Continue with generation but log the error
    }

    let documentContent = content

    // If documentId is provided, fetch content from the document
    if (documentId && !content) {
      console.log("Fetching document content for ID:", documentId)

      const { data: document, error: docError } = await supabase
        .from("documents")
        .select("title, content")
        .eq("id", documentId)
        .eq("user_id", user.id) // Ensure user owns the document
        .single()

      if (docError) {
        console.error("Error fetching document:", docError)
        return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 })
      }

      documentContent = document.content || "No content available in this document."
      console.log("Document content fetched, length:", documentContent.length)
    }

    if (!documentContent || documentContent.trim().length === 0) {
      console.log("No content provided")
      return NextResponse.json({ error: "Content or document is required" }, { status: 400 })
    }

    // Initialize Groq client
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    console.log("Generating quiz with Groq AI...")

    // Create the prompt based on quiz type
    let prompt = `
Create a multiple-choice quiz based on the following content. 
The quiz should have ${questionCount} questions with 4 options each.
Difficulty level: ${difficulty} (Easy: Basic recall, Medium: Application, Hard: Analysis)

Format the response as a valid JSON array with the following structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Brief explanation of why this is the correct answer",
    "points": ${difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3}
  }
]

Content: ${documentContent.substring(0, 4000)}
`

    // Modify prompt based on quiz type
    if (quizType === "true_false") {
      prompt = `
Create a true/false quiz based on the following content.
The quiz should have ${questionCount} questions.
Difficulty level: ${difficulty}

Format the response as a valid JSON array:
[
  {
    "id": 1,
    "type": "true_false",
    "question": "Statement to evaluate",
    "correct_answer": "true",
    "explanation": "Explanation of why this is true/false",
    "points": ${difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3}
  }
]

Content: ${documentContent.substring(0, 4000)}
`
    } else if (quizType === "short_answer") {
      prompt = `
Create a short answer quiz based on the following content.
The quiz should have ${questionCount} questions.
Difficulty level: ${difficulty}

Format the response as a valid JSON array:
[
  {
    "id": 1,
    "type": "short_answer",
    "question": "Question requiring a short answer",
    "correct_answer": "Expected answer",
    "explanation": "Explanation of the answer",
    "points": ${difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3}
  }
]

Content: ${documentContent.substring(0, 4000)}
`
    }

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    })

    console.log("AI response received, parsing...")

    // Parse the generated quiz
    let questions
    try {
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

      questions = JSON.parse(cleanedText)

      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array")
      }

      // Ensure each question has required fields and add missing ones
      questions = questions.map((q, index) => ({
        id: `q${index + 1}`,
        type: q.type || (quizType === "mixed" ? "mcq" : quizType),
        question: q.question || `Question ${index + 1}`,
        options:
          q.options ||
          (quizType === "true_false" ? ["True", "False"] : ["Option A", "Option B", "Option C", "Option D"]),
        correct_answer: q.correct_answer || (q.options ? q.options[0] : "true"),
        explanation: q.explanation || "No explanation provided.",
        points: q.points || (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3),
      }))

      console.log("Questions parsed successfully:", questions.length)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Cleaned text:", text.substring(0, 500))

      // Return fallback questions if JSON parsing fails
      questions = generateFallbackQuestions(questionCount, difficulty, quizType)
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0)

    const quiz = {
      id: `quiz_${Date.now()}`,
      title: title || "Generated Quiz",
      questions,
      time_limit: timeLimit,
      total_points: totalPoints,
      difficulty,
      subject_id: subjectId,
      document_id: documentId,
    }

    // Save the quiz to the database
    try {
      const { error: saveError } = await supabase.from("quizzes").insert({
        user_id: user.id,
        document_id: documentId,
        title: quiz.title,
        questions: quiz.questions,
        difficulty: quiz.difficulty,
        total_points: quiz.total_points,
        time_limit: quiz.time_limit,
        subject_id: quiz.subject_id,
      })

      if (saveError) {
        console.error("Error saving quiz to database:", saveError)
        // Continue anyway, don't fail the request
      } else {
        console.log("Quiz saved to database successfully")
      }
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue anyway
    }

    // Update monthly usage
    try {
      await updateMonthlyUsage(user.id, "quiz_generations", 1)
    } catch (usageError) {
      console.error("Error updating usage:", usageError)
      // Continue anyway
    }

    console.log("Quiz created successfully:", {
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz.questions.length,
      totalPoints: quiz.total_points,
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("=== Quiz Generation Error ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Return a simple emergency quiz
    const emergencyQuiz = {
      id: `quiz_emergency_${Date.now()}`,
      title: "Sample Quiz",
      questions: generateFallbackQuestions(5, "medium", "mcq"),
      time_limit: 10,
      total_points: 10,
      difficulty: "medium",
      subject_id: null,
    }

    console.log("Returning emergency quiz")
    return NextResponse.json(emergencyQuiz)
  }
}

function generateFallbackQuestions(count: number, difficulty: string, type: string) {
  const questions = []
  const points = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3

  for (let i = 0; i < count; i++) {
    const questionId = `q${i + 1}`

    if (type === "mcq" || (type === "mixed" && i % 3 === 0)) {
      questions.push({
        id: questionId,
        type: "mcq",
        question: `What is an important concept to understand in this subject area?`,
        options: ["Key concept A", "Key concept B", "Key concept C", "Key concept D"],
        correct_answer: "Key concept A",
        explanation: "This represents a fundamental concept in the study material.",
        points,
      })
    } else if (type === "true_false" || (type === "mixed" && i % 3 === 1)) {
      questions.push({
        id: questionId,
        type: "true_false",
        question: "Learning and understanding concepts is important for academic success.",
        correct_answer: "true",
        explanation: "Understanding concepts is fundamental to academic achievement.",
        points,
      })
    } else {
      questions.push({
        id: questionId,
        type: "short_answer",
        question: "Name one important study strategy.",
        correct_answer: "Active recall",
        explanation: "Active recall is a proven effective study technique.",
        points,
      })
    }
  }

  return questions
}

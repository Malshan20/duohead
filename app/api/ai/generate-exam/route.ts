import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Helper function to attempt to fix common JSON issues
function sanitizeJsonString(jsonString: string): string {
  try {
    // Remove any text before the first opening brace
    const firstBrace = jsonString.indexOf("{")
    if (firstBrace > 0) {
      jsonString = jsonString.substring(firstBrace)
    }

    // Remove any text after the last closing brace
    const lastBrace = jsonString.lastIndexOf("}")
    if (lastBrace !== -1 && lastBrace < jsonString.length - 1) {
      jsonString = jsonString.substring(0, lastBrace + 1)
    }

    // Replace any unescaped newlines, tabs, etc. in strings
    jsonString = jsonString.replace(/("(?:[^"\\]|\\.)*"):?\s*"([^"]*(?:\\.[^"]*)*)"/g, (match, p1, p2) => {
      const sanitizedP2 = p2.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
      return `${p1}: "${sanitizedP2}"`
    })

    return jsonString
  } catch (e) {
    console.error("Error sanitizing JSON string:", e)
    return jsonString // Return original if sanitization fails
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting exam generation...")

    // Verify user authentication using cookies
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    const examConfig = await request.json()
    console.log("Exam config received:", examConfig)

    if (!examConfig.title || !examConfig.type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 })
    }

    // If a unit is specified, fetch its details to include in the prompt
    let unitDetails = ""
    if (examConfig.unit) {
      const { data: unit } = await supabase.from("units").select("name, description").eq("id", examConfig.unit).single()

      if (unit) {
        unitDetails = `
        Unit: ${unit.name}
        ${unit.description ? `Unit Description: ${unit.description}` : ""}
        `
      }
    }

    console.log("Calling Groq API...")

    // Generate exam questions using AI
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are an expert exam generator. Create high-quality exam questions based on the given configuration. 

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "mcq",
      "marks": 5,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "difficulty": "medium",
      "topic": "Topic name"
    }
  ]
}

For MCQ questions: include "options" array and "correct_answer" (index 0-3)
For essay/structured questions: include "sample_answer" instead of options
For short_answer questions: include brief "sample_answer"

Make questions academically rigorous and appropriate for the specified difficulty level.

CRITICAL: Ensure your response is ONLY the JSON object with no additional text, markdown formatting, or code blocks.`,
      prompt: `Generate an exam with the following configuration:
- Title: ${examConfig.title}
- Type: ${examConfig.type}
- Number of questions: ${examConfig.questionCount}
- Total marks: ${examConfig.totalMarks}
- Difficulty: ${examConfig.difficulty}
- Duration: ${examConfig.duration} minutes
- Subject: ${examConfig.subject || "General"}
${examConfig.unit ? `- Unit: ${examConfig.unit}` : ""}
${unitDetails}

${examConfig.unit ? `Focus specifically on content from this unit.` : "Cover a range of topics from the subject."}
Create ${examConfig.questionCount} questions that total ${examConfig.totalMarks} marks.`,
      temperature: 0.5, // Lower temperature for more consistent formatting
      maxTokens: 3000,
    })

    console.log("Groq API response received, length:", text.length)

    // Parse and validate the response with improved error handling
    let examData
    try {
      // First try to parse the raw response
      try {
        examData = JSON.parse(text)
        console.log("Successfully parsed exam data on first attempt")
      } catch (initialParseError) {
        // If that fails, try to sanitize and parse again
        console.log("Initial parse failed, attempting to sanitize JSON")
        const sanitizedJson = sanitizeJsonString(text)

        try {
          examData = JSON.parse(sanitizedJson)
          console.log("Successfully parsed sanitized JSON")
        } catch (sanitizedParseError) {
          // If sanitization doesn't work, try to extract JSON using regex
          console.log("Sanitized parse failed, attempting regex extraction")
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              examData = JSON.parse(jsonMatch[0])
              console.log("Successfully parsed JSON extracted with regex")
            } catch (regexParseError) {
              throw new Error("All parsing attempts failed")
            }
          } else {
            throw new Error("Could not extract JSON with regex")
          }
        }
      }

      // Validate the structure of the parsed data
      if (!examData || !Array.isArray(examData.questions)) {
        throw new Error("Invalid exam data structure")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw response:", text)

      // Log the first 500 characters for debugging
      console.log("First 500 chars of response:", text.substring(0, 500))

      // Create a fallback exam
      console.log("Creating fallback exam data")
      examData = {
        questions: Array.from({ length: examConfig.questionCount }, (_, i) => ({
          id: `q${i + 1}`,
          question: `Sample question ${i + 1} for ${examConfig.title}`,
          type: examConfig.type,
          marks: Math.ceil(examConfig.totalMarks / examConfig.questionCount),
          difficulty: examConfig.difficulty,
          topic: "General",
          ...(examConfig.type === "mcq"
            ? {
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_answer: 0,
              }
            : {
                sample_answer: "Sample answer for this question.",
              }),
        })),
      }
    }

    // Save to database with unit_id if provided
    const { data: savedExam, error } = await supabase
      .from("generated_exams")
      .insert({
        title: examConfig.title,
        exam_type: examConfig.type,
        duration: examConfig.duration,
        total_marks: examConfig.totalMarks,
        questions: examData.questions,
        user_id: user.id,
        subject_id: examConfig.subject || null,
        unit_id: examConfig.unit || null, // Save the unit_id
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving exam to database:", error)
      return NextResponse.json({ error: "Failed to save exam" }, { status: 500 })
    }

    console.log("Returning exam data with", examData.questions?.length, "questions")
    return NextResponse.json({ exam: examData, savedExam })
  } catch (error) {
    console.error("Exam generation API error:", error)

    // Provide more specific error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        error: "Failed to generate exam",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

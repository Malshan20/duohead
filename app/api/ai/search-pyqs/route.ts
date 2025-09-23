import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@/lib/supabase/client"

// Define PYQ type
interface PYQ {
  id: string
  question: string
  answer: string
  subject: string
  year: number
  exam_type: string
  difficulty: string
  marks: number
  topic: string
  university: string
  course: string
  created_at: string
  source_url?: string
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client for server-side authentication
    const supabase = createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check - User:", user?.id, "Error:", authError)

    // Allow the search to work even without authentication for now
    // In production, you might want to require authentication
    if (authError) {
      console.warn("Authentication warning:", authError)
    }

    const { query, filters } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    console.log("Processing search request:", { query, filters })

    // Log the search if user is authenticated
    if (user) {
      try {
        await supabase.from("pyq_searches").insert({
          user_id: user.id,
          query: query,
          filters: filters,
        })
      } catch (logError) {
        console.warn("Failed to log search:", logError)
        // Continue even if logging fails
      }
    }

    // Build a search prompt based on the query and filters
    let searchPrompt = `Generate 5 realistic previous year questions (PYQs) about "${query}"`

    if (filters.subject && filters.subject !== "all") {
      searchPrompt += ` for the subject "${filters.subject}"`
    }

    if (filters.year && filters.year !== "all") {
      searchPrompt += ` from the year ${filters.year}`
    }

    if (filters.examType && filters.examType !== "all") {
      searchPrompt += ` for ${filters.examType} exams`
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      searchPrompt += ` with ${filters.difficulty} difficulty`
    }

    if (filters.university && filters.university !== "") {
      searchPrompt += ` from ${filters.university}`
    }

    searchPrompt += `

IMPORTANT: Return ONLY a valid JSON array. No additional text, explanations, or formatting.

Each question object should have these exact fields:
- question: string (the question text, keep it concise and avoid special characters)
- answer: string (brief answer, avoid quotes and special characters)
- subject: string
- year: number (between 2018-2023)
- exam_type: string (midterm, final, quiz, or assignment)
- difficulty: string (easy, medium, or hard)
- marks: number (between 5-25)
- topic: string
- university: string
- course: string

Example format:
[
  {
    "question": "What is the time complexity of binary search algorithm",
    "answer": "O(log n) because we divide the search space in half at each step",
    "subject": "Computer Science",
    "year": 2023,
    "exam_type": "midterm",
    "difficulty": "medium",
    "marks": 10,
    "topic": "Algorithms",
    "university": "MIT",
    "course": "CS 101"
  }
]

Generate 5 such questions now:`

    try {
      // Check if GROQ_API_KEY is available
      if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY not found, using fallback data")
        throw new Error("GROQ_API_KEY not configured")
      }

      console.log("Calling Groq API...")

      // Use Groq to generate realistic PYQs
      const { text: pyqsJson } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: searchPrompt,
        temperature: 0.3, // Lower temperature for more consistent JSON
        maxTokens: 1500,
      })

      console.log("Raw AI response:", pyqsJson)

      // Clean the response to ensure valid JSON
      let cleanedJson = pyqsJson.trim()

      // Remove any markdown code blocks
      cleanedJson = cleanedJson.replace(/```json\s*/g, "").replace(/```\s*/g, "")

      // Remove any text before the first [ and after the last ]
      const startIndex = cleanedJson.indexOf("[")
      const endIndex = cleanedJson.lastIndexOf("]")

      if (startIndex !== -1 && endIndex !== -1) {
        cleanedJson = cleanedJson.substring(startIndex, endIndex + 1)
      }

      console.log("Cleaned JSON:", cleanedJson)

      // Parse the JSON response
      let pyqs: PYQ[] = []
      try {
        pyqs = JSON.parse(cleanedJson)
      } catch (parseError) {
        console.error("JSON parsing failed, using fallback data:", parseError)
        // Use fallback data if JSON parsing fails
        pyqs = generateMockPYQs(query, filters)
      }

      // Validate and format the PYQs
      const formattedPyqs = pyqs.map((pyq, index) => ({
        id: `pyq-${Date.now()}-${index}`,
        question: String(pyq.question || "Sample question").substring(0, 500),
        answer: String(pyq.answer || "Sample answer").substring(0, 1000),
        subject: String(pyq.subject || filters.subject || "General"),
        year: Number(pyq.year) || 2023,
        exam_type: String(pyq.exam_type || "midterm"),
        difficulty: String(pyq.difficulty || "medium"),
        marks: Number(pyq.marks) || 10,
        topic: String(pyq.topic || "General Topic"),
        university: String(pyq.university || "University"),
        course: String(pyq.course || "Course 101"),
        created_at: new Date().toISOString(),
        source_url: `https://example.edu/${String(pyq.university || "university")
          .toLowerCase()
          .replace(/\s+/g, "-")}/exams/${pyq.year || 2023}`,
      }))

      console.log("Returning formatted PYQs:", formattedPyqs.length)

      return NextResponse.json({ results: formattedPyqs })
    } catch (aiError) {
      console.error("AI generation error:", aiError)
      // Fallback to mock data
      const mockPYQs = generateMockPYQs(query, filters)
      return NextResponse.json({
        results: mockPYQs,
        notice: "Using enhanced mock data due to search service limitations",
      })
    }
  } catch (error) {
    console.error("PYQ search API error:", error)
    return NextResponse.json({ error: "Failed to search PYQs" }, { status: 500 })
  }
}

// Function to generate relevant mock PYQs based on the query
function generateMockPYQs(query: string, filters: any): PYQ[] {
  const subjects = [
    "Computer Science",
    "Data Structures",
    "Algorithms",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
  ]

  const questionTemplates = {
    "Computer Science": [
      "Explain the concept of object-oriented programming and its key principles",
      "What is the difference between stack and queue data structures",
      "Describe the working of a hash table with collision resolution",
      "Explain the concept of recursion with a practical example",
      "What are the advantages of using databases over file systems",
    ],
    "Data Structures": [
      "Implement a binary search tree with insertion and deletion operations",
      "Explain the time complexity of different sorting algorithms",
      "What is the difference between arrays and linked lists",
      "Describe the implementation of a priority queue using heaps",
      "Explain graph traversal algorithms BFS and DFS",
    ],
    Algorithms: [
      "Analyze the time complexity of merge sort algorithm",
      "Explain dynamic programming with the knapsack problem",
      "Describe Dijkstra's shortest path algorithm",
      "What is the greedy approach in algorithm design",
      "Explain the divide and conquer strategy with examples",
    ],
    Mathematics: [
      "Solve the given system of linear equations using matrix methods",
      "Find the derivative of the given function using chain rule",
      "Calculate the probability of the given scenario",
      "Prove the given mathematical theorem using induction",
      "Solve the differential equation with initial conditions",
    ],
    Physics: [
      "Explain Newton's laws of motion with real-world examples",
      "Calculate the electric field due to a point charge",
      "Describe the photoelectric effect and its applications",
      "Explain the concept of wave-particle duality",
      "Calculate the momentum and energy in relativistic mechanics",
    ],
  }

  const universities = ["MIT", "Stanford", "Berkeley", "Harvard", "Princeton", "CMU", "Caltech"]
  const examTypes = ["midterm", "final", "quiz", "assignment"]
  const difficulties = ["easy", "medium", "hard"]

  // Determine the most relevant subject
  const relevantSubject =
    subjects.find((s) => query.toLowerCase().includes(s.toLowerCase())) ||
    (filters.subject !== "all" ? filters.subject : "Computer Science")

  const templates =
    questionTemplates[relevantSubject as keyof typeof questionTemplates] || questionTemplates["Computer Science"]

  return Array(5)
    .fill(0)
    .map((_, index) => {
      const template = templates[index % templates.length]
      const university = filters.university || universities[Math.floor(Math.random() * universities.length)]
      const year = filters.year !== "all" ? Number.parseInt(filters.year) : 2018 + Math.floor(Math.random() * 6)
      const exam_type =
        filters.examType !== "all" ? filters.examType : examTypes[Math.floor(Math.random() * examTypes.length)]
      const difficulty =
        filters.difficulty !== "all"
          ? filters.difficulty
          : difficulties[Math.floor(Math.random() * difficulties.length)]
      const marks = 5 + Math.floor(Math.random() * 21)

      return {
        id: `pyq-${Date.now()}-${index}`,
        question: `${template}. Relate your answer to ${query}.`,
        answer: `This question involves understanding the fundamental concepts of ${relevantSubject}. The key points to consider are the theoretical foundations and practical applications related to ${query}.`,
        subject: relevantSubject,
        year,
        exam_type,
        difficulty,
        marks,
        topic: query,
        university,
        course: `${relevantSubject.substring(0, 3).toUpperCase()} ${100 + Math.floor(Math.random() * 400)}`,
        created_at: new Date().toISOString(),
        source_url: `https://example.edu/${university.toLowerCase().replace(/\s+/g, "-")}/exams/${year}`,
      }
    })
}

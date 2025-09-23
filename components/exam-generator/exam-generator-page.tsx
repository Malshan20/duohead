"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Clock,
  FileText,
  Download,
  Play,
  Calendar,
  Brain,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  Layers,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// First, import the subscription limit utilities
import type { SubscriptionTier } from "@/lib/subscription-limits"

interface PYQ {
  id: string
  question: string
  answer?: string
  subject: string
  year: number
  exam_type: string
  difficulty: "easy" | "medium" | "hard"
  marks: number
  topic: string
  university?: string
  course?: string
  created_at: string
}

interface GeneratedExam {
  id: string
  title: string
  exam_type: "mcq" | "essay" | "structured" | "mixed"
  duration: number
  total_marks: number
  questions: ExamQuestion[]
  created_at: string
  user_id: string
  subject_id?: string
  unit_id?: string
}

interface ExamQuestion {
  id: string
  question: string
  type: "mcq" | "essay" | "structured" | "short_answer"
  marks: number
  options?: string[]
  correct_answer?: string | number
  sample_answer?: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
}

interface Subject {
  id: string
  name: string
  color: string
}

interface Unit {
  id: string
  name: string
  subject_id: string
  description?: string
}

export function ExamGeneratorPage() {
  const supabase = createClient()
  const { toast } = useToast()

  // State management
  const [activeTab, setActiveTab] = useState("search")
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([])

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState({
    subject: "",
    year: "",
    examType: "",
    difficulty: "",
    university: "",
  })
  const [searchResults, setSearchResults] = useState<PYQ[]>([])
  const [searching, setSearching] = useState(false)

  // Exam generation state
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [examConfig, setExamConfig] = useState({
    title: "",
    type: "mcq" as "mcq" | "essay" | "structured" | "mixed",
    duration: 60,
    totalMarks: 100,
    questionCount: 10,
    subject: "",
    unit: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    includeTopics: [] as string[],
    useAI: true,
    usePYQs: true,
  })
  const [generating, setGenerating] = useState(false)

  // Exam taking state
  const [showExamDialog, setShowExamDialog] = useState(false)
  const [currentExam, setCurrentExam] = useState<GeneratedExam | null>(null)
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({})
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)
  const [examTimeLeft, setExamTimeLeft] = useState(0)
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Add state for tracking usage and user's tier
  const [examUsage, setExamUsage] = useState(0)
  const [userTier, setUserTier] = useState<SubscriptionTier>("Seedling")

  // Add after the other state declarations
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>("")

  // Add new unit dialog state
  const [showAddUnitDialog, setShowAddUnitDialog] = useState(false)
  const [newUnit, setNewUnit] = useState({
    name: "",
    description: "",
  })
  const [addingUnit, setAddingUnit] = useState(false)

  // Add this after the fetchData function
  const [analyticsData, setAnalyticsData] = useState({
    totalAttempts: 0,
    completedExams: 0,
    averageScore: 0,
    timeSpent: 0,
    difficultyBreakdown: {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    },
    recentAttempts: [],
  })

  useEffect(() => {
    fetchData()
    fetchAnalyticsData()
  }, [])

  // Timer for exam
  useEffect(() => {
    if (examStartTime && examTimeLeft > 0 && !examSubmitted) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - examStartTime.getTime()) / 1000)
        const remaining = Math.max(0, (currentExam?.duration || 0) * 60 - elapsed)
        setExamTimeLeft(remaining)

        if (remaining === 0) {
          handleSubmitExam()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [examStartTime, examTimeLeft, examSubmitted, currentExam])

  const fetchData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Add this to the fetchData function to get the user's tier and usage
      const fetchUserTierAndUsage = async (userId: string) => {
        try {
          // Get user's subscription tier
          const { data: profileData } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .single()

          setUserTier((profileData?.subscription_tier || "Seedling") as SubscriptionTier)

          // Count exams generated
          const { count, error } = await supabase
            .from("generated_exams")
            .select("id", { count: "exact" })
            .eq("user_id", userId)

          if (error && error.code !== "42P01") throw error // Ignore table doesn't exist error

          setExamUsage(count || 0)
        } catch (error) {
          console.error("Error fetching user tier and usage:", error)
        }
      }

      // Call this function in fetchData after getting the user
      if (user) {
        await fetchUserTierAndUsage(user.id)
      }

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase.from("subjects").select("*").order("name")

      if (subjectsError) throw subjectsError

      // Fetch generated exams
      const { data: examsData, error: examsError } = await supabase
        .from("generated_exams")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (examsError && examsError.code !== "42P01") {
        // Ignore table doesn't exist error
        console.error("Error fetching exams:", examsError)
      }

      setSubjects(subjectsData || [])
      setGeneratedExams(examsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add this function after the fetchData function
  const fetchUnits = async (subjectId: string) => {
    if (!subjectId) return

    try {
      // First check if the units table exists
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .eq("subject_id", subjectId)
        .order("name")

      if (unitsError && unitsError.code !== "42P01") {
        // Ignore table doesn't exist error
        console.error("Error fetching units:", unitsError)
      }

      setUnits(unitsData || [])
    } catch (error) {
      console.error("Error fetching units:", error)
    }
  }

  // Add this function to handle adding a new unit
  const handleAddUnit = async () => {
    if (!examConfig.subject) {
      toast({
        title: "No subject selected",
        description: "Please select a subject before adding a unit.",
        variant: "destructive",
      })
      return
    }

    if (!newUnit.name.trim()) {
      toast({
        title: "Unit name required",
        description: "Please provide a name for the unit.",
        variant: "destructive",
      })
      return
    }

    setAddingUnit(true)

    try {
      const { data: unit, error } = await supabase
        .from("units")
        .insert({
          name: newUnit.name.trim(),
          description: newUnit.description.trim(),
          subject_id: examConfig.subject,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Unit added",
        description: `"${newUnit.name}" has been added to your subject.`,
      })

      // Refresh units list
      await fetchUnits(examConfig.subject)

      // Select the newly created unit
      if (unit) {
        setSelectedUnit(unit.id)
        setExamConfig({ ...examConfig, unit: unit.id })
      }

      // Reset and close dialog
      setNewUnit({ name: "", description: "" })
      setShowAddUnitDialog(false)
    } catch (error) {
      console.error("Error adding unit:", error)
      toast({
        title: "Failed to add unit",
        description: "An error occurred while adding the unit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingUnit(false)
    }
  }

  const searchPYQs = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter search query",
        description: "Please enter a topic, question, or keyword to search.",
        variant: "destructive",
      })
      return
    }

    setSearching(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Log the search
      try {
        await supabase.from("pyq_searches").insert({
          user_id: user.id,
          query: searchQuery,
          filters: searchFilters,
        })
      } catch (logError) {
        console.warn("Failed to log search:", logError)
        // Continue even if logging fails
      }

      console.log("Making PYQ search request with:", { query: searchQuery, filters: searchFilters })

      // Search using AI-powered semantic search
      const response = await fetch("/api/ai/search-pyqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: searchFilters,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`Search failed: ${response.status} - ${errorText}`)
      }

      const responseData = await response.json()
      console.log("Search results:", responseData)

      if (!responseData.results) {
        throw new Error("Invalid response format: missing results")
      }

      setSearchResults(responseData.results)

      toast({
        title: "Search completed",
        description: `Found ${responseData.results.length} relevant questions.${
          responseData.notice ? ` (${responseData.notice})` : ""
        }`,
      })
    } catch (error) {
      console.error("Error searching PYQs:", error)

      // Provide more specific error messages
      let errorMessage = "Please try again later."

      if (error instanceof Error) {
        if (error.message.includes("Not authenticated")) {
          errorMessage = "Please sign in to search for questions."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Check your internet connection."
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. The search service is temporarily unavailable."
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication error. Please sign in again."
        } else {
          errorMessage = `Search error: ${error.message}`
        }
      }

      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      })

      // Provide fallback mock results for development
      if (process.env.NODE_ENV === "development") {
        console.log("Providing fallback mock results for development")
        const mockResults = [
          {
            id: "mock-1",
            question: `What are the key concepts related to "${searchQuery}"? Explain with examples.`,
            answer: `The key concepts related to ${searchQuery} include fundamental principles and practical applications...`,
            subject: searchFilters.subject || "Computer Science",
            year: 2023,
            exam_type: "midterm",
            difficulty: "medium",
            marks: 10,
            topic: searchQuery,
            university: "Sample University",
            course: "CS 101",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-2",
            question: `Analyze the importance of "${searchQuery}" in modern applications.`,
            answer: `${searchQuery} plays a crucial role in modern applications because...`,
            subject: searchFilters.subject || "Computer Science",
            year: 2022,
            exam_type: "final",
            difficulty: "hard",
            marks: 15,
            topic: searchQuery,
            university: "Sample University",
            course: "CS 201",
            created_at: new Date().toISOString(),
          },
        ]

        setSearchResults(mockResults)
        toast({
          title: "Development Mode",
          description: "Using mock data for development. Check console for error details.",
          variant: "default",
        })
      }
    } finally {
      setSearching(false)
    }
  }

  const generateExam = async () => {
    if (!examConfig.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your exam.",
        variant: "destructive",
      })
      return
    }

    // Check limits
    const examLimit = userTier === "Seedling" ? 10 : userTier === "Forest Guardian" ? 30 : Number.POSITIVE_INFINITY
    if (examUsage >= examLimit) {
      toast({
        title: "Exam generation limit reached",
        description: `You've reached your exam generation limit. Upgrade your plan for ${userTier === "Seedling" ? "more" : "unlimited"} exam generations.`,
        variant: "destructive",
      })
      return
    }

    setGenerating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Call the API to generate and save the exam
      const response = await fetch("/api/ai/generate-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examConfig),
      })

      if (!response.ok) throw new Error("Exam generation failed")

      const { exam, savedExam } = await response.json()

      toast({
        title: "Exam generated successfully!",
        description: `Created ${exam.questions.length} questions for your exam.`,
      })

      setShowGenerateDialog(false)
      // Reset exam config after successful generation
      setExamConfig({
        title: "",
        type: "mcq",
        duration: 60,
        totalMarks: 100,
        questionCount: 10,
        subject: "",
        unit: "",
        difficulty: "medium",
        includeTopics: [],
        useAI: true,
        usePYQs: true,
      })
      setSelectedUnit("")
      fetchData() // Refresh the exams list
    } catch (error) {
      console.error("Error generating exam:", error)
      toast({
        title: "Generation failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const startExam = (exam: GeneratedExam) => {
    setCurrentExam(exam)
    setExamAnswers({})
    setExamStartTime(new Date())
    setExamTimeLeft(exam.duration * 60)
    setExamSubmitted(false)
    setShowExamDialog(true)
  }

  const handleSubmitExam = async () => {
    if (!currentExam) return

    setExamSubmitted(true)

    try {
      // Calculate score
      let score = 0
      let totalMarks = 0
      let correctAnswers = 0
      const totalQuestions = currentExam.questions.length
      const questionsByDifficulty = {
        easy: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        hard: { total: 0, correct: 0 },
      }

      currentExam.questions.forEach((question) => {
        totalMarks += question.marks
        const userAnswer = examAnswers[question.id]

        // Track difficulty stats
        questionsByDifficulty[question.difficulty].total += 1

        if (question.type === "mcq" && userAnswer === question.correct_answer) {
          score += question.marks
          correctAnswers += 1
          questionsByDifficulty[question.difficulty].correct += 1
        }
        // For essay/structured questions, we'd need manual grading or AI evaluation
      })

      const percentage = Math.round((score / totalMarks) * 100)
      const timeTaken = (currentExam.duration * 60 - examTimeLeft) / 60

      toast({
        title: "Exam submitted!",
        description: `You scored ${score}/${totalMarks} marks (${percentage}%)`,
      })

      // Save exam attempt to database with detailed analytics
      await supabase.from("exam_attempts").insert({
        exam_id: currentExam.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        answers: examAnswers,
        score,
        total_marks: totalMarks,
        time_taken: timeTaken,
        percentage,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        difficulty_breakdown: questionsByDifficulty,
        subject_id: currentExam.subject_id,
        unit_id: currentExam.unit_id,
        completed_at: new Date().toISOString(),
      })

      // Refresh analytics data
      fetchAnalyticsData()
    } catch (error) {
      console.error("Error submitting exam:", error)
    }
  }

  const deleteExam = async (examId: string) => {
    try {
      const { error } = await supabase.from("generated_exams").delete().eq("id", examId)

      if (error) throw error

      toast({
        title: "Exam deleted",
        description: "The exam has been successfully deleted.",
      })

      // Refresh the exams list
      fetchData()
    } catch (error) {
      console.error("Error deleting exam:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const [examToEdit, setExamToEdit] = useState<GeneratedExam | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    duration: 60,
  })

  const openEditDialog = (exam: GeneratedExam) => {
    setExamToEdit(exam)
    setEditFormData({
      title: exam.title,
      duration: exam.duration,
    })
    setShowEditDialog(true)
  }

  const saveExamEdit = async () => {
    if (!examToEdit) return

    try {
      const { error } = await supabase
        .from("generated_exams")
        .update({
          title: editFormData.title,
          duration: editFormData.duration,
        })
        .eq("id", examToEdit.id)

      if (error) throw error

      toast({
        title: "Exam updated",
        description: "The exam has been successfully updated.",
      })

      setShowEditDialog(false)
      fetchData() // Refresh the exams list
    } catch (error) {
      console.error("Error updating exam:", error)
      toast({
        title: "Update failed",
        description: "Failed to update the exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get all exam attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

      if (attemptsError && attemptsError.code !== "42P01") {
        console.error("Error fetching exam attempts:", attemptsError)
        return
      }

      if (!attempts || attempts.length === 0) {
        return // No attempts yet
      }

      // Calculate analytics
      const totalAttempts = attempts.length
      const completedExams = new Set(attempts.map((a) => a.exam_id)).size

      let totalScore = 0
      let totalTimeSpent = 0
      const difficultyBreakdown = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      }

      attempts.forEach((attempt) => {
        totalScore += attempt.percentage || 0
        totalTimeSpent += attempt.time_taken || 0

        // Aggregate difficulty breakdown if available
        if (attempt.difficulty_breakdown) {
          Object.entries(attempt.difficulty_breakdown).forEach(([difficulty, stats]) => {
            if (difficultyBreakdown[difficulty]) {
              difficultyBreakdown[difficulty].correct += stats.correct || 0
              difficultyBreakdown[difficulty].total += stats.total || 0
            }
          })
        }
      })

      const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0

      setAnalyticsData({
        totalAttempts,
        completedExams,
        averageScore,
        timeSpent: Math.round(totalTimeSpent),
        difficultyBreakdown,
        recentAttempts: attempts.slice(0, 5), // Get 5 most recent attempts
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Generator with PYQs</h1>
          {/* Add a usage indicator in the header section */}
          {/* Add this after the header description */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Search previous year questions and generate AI-powered practice exams.
            </p>
            {userTier !== "Jungle Master" && (
              <Badge variant="outline" className="ml-2">
                {examUsage} / {userTier === "Seedling" ? "10" : "30"} exams generated
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Generate Exam
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">PYQ Search</TabsTrigger>
          <TabsTrigger value="exams">My Exams</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* PYQ Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                AI-Powered PYQ Search
              </CardTitle>
              <CardDescription>
                Search through thousands of previous year questions using advanced AI semantic search.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for topics, concepts, or specific questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && searchPYQs()}
                />
                <Button onClick={searchPYQs} disabled={searching}>
                  {searching ? <Brain className="mr-2 h-4 w-4 animate-pulse" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Select
                  value={searchFilters.subject}
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={searchFilters.year}
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, year: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={searchFilters.examType}
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, examType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={searchFilters.difficulty}
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="University"
                  value={searchFilters.university}
                  onChange={(e) => setSearchFilters({ ...searchFilters, university: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((pyq) => (
                    <div key={pyq.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{pyq.subject}</Badge>
                            <Badge className={getDifficultyColor(pyq.difficulty)}>{pyq.difficulty}</Badge>
                            <Badge variant="secondary">{pyq.year}</Badge>
                            <Badge variant="outline">{pyq.marks} marks</Badge>
                          </div>
                          <p className="font-medium mb-2">{pyq.question}</p>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span>Topic: {pyq.topic}</span>
                            {pyq.university && <span> • University: {pyq.university}</span>}
                            {pyq.course && <span> • Course: {pyq.course}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Show detailed view of the question
                              toast({
                                title: pyq.question,
                                description: pyq.answer || "No answer provided for this question.",
                              })
                            }}
                            title="View question details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Add question to exam generation
                              setExamConfig((prev) => ({
                                ...prev,
                                includeTopics: [...prev.includeTopics, pyq.topic].filter(
                                  (topic, index, arr) => arr.indexOf(topic) === index,
                                ),
                              }))
                              toast({
                                title: "Question added",
                                description: `Added "${pyq.topic}" topic to your exam configuration.`,
                              })
                            }}
                            title="Add to exam"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          {generatedExams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No exams generated yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first AI-powered exam with previous year questions.
                </p>
                <Button onClick={() => setShowGenerateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedExams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{exam.exam_type.toUpperCase()}</Badge>
                          <Badge variant="secondary">{exam.questions.length} questions</Badge>
                          <Badge variant="outline">{exam.total_marks} marks</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(exam)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this exam?")) {
                              deleteExam(exam.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(exam.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startExam(exam)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Play className="mr-2 h-4 w-4" />
                          Start Exam
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{generatedExams.length}</div>
                <p className="text-sm text-gray-600">Total Exams</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{analyticsData.completedExams}</div>
                <p className="text-sm text-gray-600">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{analyticsData.averageScore}%</div>
                <p className="text-sm text-gray-600">Avg Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{analyticsData.timeSpent}</div>
                <p className="text-sm text-gray-600">Minutes Studied</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Difficulty</CardTitle>
              <CardDescription>Your success rate across different difficulty levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.difficultyBreakdown).map(([difficulty, stats]) => {
                  const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
                  return (
                    <div key={difficulty} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
                          <span className="text-sm font-medium">
                            {stats.correct}/{stats.total} correct ({percentage}%)
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Exam Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exam Attempts</CardTitle>
              <CardDescription>Your latest exam performances</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.recentAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {generatedExams.find((e) => e.id === attempt.exam_id)?.title || "Exam"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(attempt.completed_at).toLocaleDateString()} • {attempt.time_taken} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{attempt.percentage}%</p>
                        <p className="text-sm text-gray-500">
                          {attempt.score}/{attempt.total_marks} marks
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exam attempts yet.</p>
                  <p className="text-sm">Start by taking your first exam!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Exam Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate AI Exam
            </DialogTitle>
            <DialogDescription>
              Create a custom exam with AI-generated questions and previous year questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="exam-title">Exam Title</Label>
              <Input
                id="exam-title"
                placeholder="e.g., Midterm Exam - Data Structures"
                value={examConfig.title}
                onChange={(e) => setExamConfig({ ...examConfig, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exam-type">Exam Type</Label>
                <Select
                  value={examConfig.type}
                  onValueChange={(value: any) => setExamConfig({ ...examConfig, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="essay">Essay Questions</SelectItem>
                    <SelectItem value="structured">Structured Questions</SelectItem>
                    <SelectItem value="mixed">Mixed Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exam-subject">Subject</Label>
                <Select
                  value={examConfig.subject}
                  onValueChange={(value) => {
                    setExamConfig({ ...examConfig, subject: value, unit: "" }) // Reset unit when subject changes
                    setSelectedUnit("")
                    fetchUnits(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unit selection with Add Unit button */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="exam-unit">Unit (Optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddUnitDialog(true)}
                  disabled={!examConfig.subject}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Unit
                </Button>
              </div>
              <Select
                value={selectedUnit}
                onValueChange={(value) => {
                  setSelectedUnit(value)
                  setExamConfig({ ...examConfig, unit: value === "all" ? "" : value })
                }}
                disabled={!examConfig.subject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="300"
                  value={examConfig.duration}
                  onChange={(e) => setExamConfig({ ...examConfig, duration: Number.parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="total-marks">Total Marks</Label>
                <Input
                  id="total-marks"
                  type="number"
                  min="10"
                  max="500"
                  value={examConfig.totalMarks}
                  onChange={(e) => setExamConfig({ ...examConfig, totalMarks: Number.parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="question-count">Questions</Label>
                <Input
                  id="question-count"
                  type="number"
                  min="5"
                  max="50"
                  value={examConfig.questionCount}
                  onChange={(e) => setExamConfig({ ...examConfig, questionCount: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={examConfig.difficulty}
                onValueChange={(value: any) => setExamConfig({ ...examConfig, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Generation Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-ai"
                  checked={examConfig.useAI}
                  onCheckedChange={(checked) => setExamConfig({ ...examConfig, useAI: !!checked })}
                />
                <Label htmlFor="use-ai">Generate new questions with AI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-pyqs"
                  checked={examConfig.usePYQs}
                  onCheckedChange={(checked) => setExamConfig({ ...examConfig, usePYQs: !!checked })}
                />
                <Label htmlFor="use-pyqs">Include Previous Year Questions</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateExam} disabled={generating}>
              {generating ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={showAddUnitDialog} onOpenChange={setShowAddUnitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Add New Unit
            </DialogTitle>
            <DialogDescription>Create a new unit for your subject to organize your exam questions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input
                id="unit-name"
                placeholder="e.g., Calculus, Organic Chemistry, etc."
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="unit-description">Description (Optional)</Label>
              <Textarea
                id="unit-description"
                placeholder="Brief description of what this unit covers..."
                value={newUnit.description}
                onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
              />
            </div>

            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Units help you organize your study materials and create targeted exams for specific topics.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUnitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUnit} disabled={addingUnit}>
              {addingUnit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Taking Dialog */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{currentExam?.title}</span>
              <div className="flex items-center gap-4">
                <Badge variant={examTimeLeft < 300 ? "destructive" : "secondary"}>
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTime(examTimeLeft)}
                </Badge>
                <Badge variant="outline">
                  {Object.keys(examAnswers).length}/{currentExam?.questions.length || 0} answered
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          {currentExam && !examSubmitted && (
            <div className="space-y-6">
              <Progress
                value={(Object.keys(examAnswers).length / currentExam.questions.length) * 100}
                className="h-2"
              />

              {currentExam.questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                          <Badge variant="secondary">{question.marks} marks</Badge>
                        </div>
                        <p className="font-medium">{question.question}</p>
                      </div>
                    </div>

                    {question.type === "mcq" && question.options && (
                      <RadioGroup
                        value={examAnswers[question.id]?.toString() || ""}
                        onValueChange={(value) =>
                          setExamAnswers({ ...examAnswers, [question.id]: Number.parseInt(value) })
                        }
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                            <Label htmlFor={`${question.id}-${optionIndex}`} className="flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {(question.type === "essay" ||
                      question.type === "structured" ||
                      question.type === "short_answer") && (
                      <Textarea
                        placeholder="Enter your answer here..."
                        value={examAnswers[question.id] || ""}
                        onChange={(e) => setExamAnswers({ ...examAnswers, [question.id]: e.target.value })}
                        rows={question.type === "essay" ? 8 : 4}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {examSubmitted && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Exam Submitted Successfully!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Your answers have been saved and evaluated.</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Review Your Answers</h4>
                {currentExam?.questions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                            <Badge variant="secondary">{question.marks} marks</Badge>
                            {question.type === "mcq" && examAnswers[question.id] !== undefined && (
                              <Badge
                                variant={
                                  examAnswers[question.id] === question.correct_answer ? "default" : "destructive"
                                }
                                className={examAnswers[question.id] === question.correct_answer ? "bg-green-600" : ""}
                              >
                                {examAnswers[question.id] === question.correct_answer ? "Correct" : "Incorrect"}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{question.question}</p>
                        </div>
                      </div>

                      {question.type === "mcq" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`flex items-center p-2 rounded-md ${
                                optionIndex === question.correct_answer
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : examAnswers[question.id] === optionIndex
                                    ? "bg-red-100 dark:bg-red-900/30"
                                    : ""
                              }`}
                            >
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border mr-2 border-primary">
                                {optionIndex === question.correct_answer && (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                )}
                                {examAnswers[question.id] === optionIndex &&
                                  optionIndex !== question.correct_answer && (
                                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                                  )}
                              </div>
                              <span
                                className={`${
                                  optionIndex === question.correct_answer
                                    ? "font-medium text-green-800 dark:text-green-300"
                                    : examAnswers[question.id] === optionIndex
                                      ? "text-red-800 dark:text-red-300"
                                      : ""
                                }`}
                              >
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {(question.type === "essay" ||
                        question.type === "structured" ||
                        question.type === "short_answer") && (
                        <div className="space-y-2">
                          <div className="border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm font-medium mb-1">Your Answer:</p>
                            <p className="text-sm">{examAnswers[question.id] || "No answer provided"}</p>
                          </div>
                          {question.sample_answer && (
                            <div className="border p-3 rounded-md bg-green-50 dark:bg-green-900/20">
                              <p className="text-sm font-medium mb-1 text-green-800 dark:text-green-300">
                                Sample Answer:
                              </p>
                              <p className="text-sm">{question.sample_answer}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            {!examSubmitted ? (
              <>
                <Button variant="outline" onClick={() => setShowExamDialog(false)}>
                  Save & Exit
                </Button>
                <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Exam
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowExamDialog(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Make changes to your exam settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="15"
                max="300"
                value={editFormData.duration}
                onChange={(e) => setEditFormData({ ...editFormData, duration: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveExamEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

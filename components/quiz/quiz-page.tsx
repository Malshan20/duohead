"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Trophy,
  Target,
  BookOpen,
  Brain,
  Zap,
  HelpCircle,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Question {
  id: string
  type: "mcq" | "true_false" | "fill_blank" | "short_answer"
  question: string
  options?: string[]
  correct_answer: string
  explanation?: string
  points: number
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
  time_limit: number
  total_points: number
  difficulty: string
  subject_id?: string
}

interface QuizAttempt {
  answers: Record<string, string>
  score: number
  total_points: number
  time_taken: number
  completed_at: string
}

export function QuizPage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [subjects, setSubjects] = useState<any[]>([])
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [isPaused, setIsPaused] = useState(false)

  // Form states
  const [textContent, setTextContent] = useState("")
  const [questionCount, setQuestionCount] = useState("5")
  const [difficulty, setDifficulty] = useState("medium")
  const [quizType, setQuizType] = useState("mixed")
  const [timeLimit, setTimeLimit] = useState("15")
  const [selectedSubject, setSelectedSubject] = useState("none")
  const [quizTitle, setQuizTitle] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchSubjects()
    fetchQuizHistory()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isQuizActive && timeRemaining > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleQuizSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isQuizActive, timeRemaining, isPaused])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("*").order("name")

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchQuizHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setQuizHistory(data || [])
    } catch (error) {
      console.error("Error fetching quiz history:", error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      if (file.type === "text/plain") {
        const text = await file.text()
        setTextContent(text)
        toast({
          title: "File uploaded successfully",
          description: "Text extracted and ready for quiz generation.",
        })
      } else {
        toast({
          title: "File type not supported",
          description: "Please upload a .txt file or paste text directly.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "Failed to extract text from file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const generateQuiz = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Content required",
        description: "Please provide text content or upload a file.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      console.log("=== Starting Quiz Generation ===")
      console.log("Content length:", textContent.length)
      console.log("Settings:", { questionCount, difficulty, quizType, timeLimit })

      const requestBody = {
        content: textContent.trim(),
        questionCount: Number.parseInt(questionCount),
        difficulty,
        quizType,
        timeLimit: Number.parseInt(timeLimit),
        subjectId: selectedSubject === "none" ? null : selectedSubject,
        title: quizTitle || "Generated Quiz",
      }

      console.log("Sending request:", requestBody)

      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response received:")
      console.log("- Status:", response.status)
      console.log("- Status Text:", response.statusText)
      console.log("- Content-Type:", response.headers.get("content-type"))

      // Get response text first to see what we actually received
      const responseText = await response.text()
      console.log("- Response Text:", responseText.substring(0, 200) + "...")

      // Check if it's JSON
      let quiz
      try {
        quiz = JSON.parse(responseText)
        console.log("Successfully parsed JSON response")
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        console.error("API Error Response:", quiz)
        throw new Error(quiz.error || quiz.details || "Failed to generate quiz")
      }

      if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        console.error("Invalid quiz data:", quiz)
        throw new Error("Invalid quiz data received from server")
      }

      console.log("Quiz generated successfully:", {
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        totalPoints: quiz.total_points,
      })

      setCurrentQuiz(quiz)
      setActiveTab("take")

      toast({
        title: "Quiz generated successfully",
        description: `Created ${quiz.questions.length} questions.`,
      })
    } catch (error) {
      console.error("=== Quiz Generation Failed ===")
      console.error("Error:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const startQuiz = () => {
    if (!currentQuiz) return

    setIsQuizActive(true)
    setTimeRemaining(currentQuiz.time_limit * 60)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setQuizAttempt(null)
    setIsPaused(false)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleQuizSubmit = async () => {
    if (!currentQuiz) return

    setIsQuizActive(false)

    // Calculate score
    let score = 0
    const totalPoints = currentQuiz.total_points

    currentQuiz.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id]
      if (userAnswer && userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()) {
        score += question.points
      }
    })

    const timeTaken = (currentQuiz.time_limit * 60 - timeRemaining) / 60

    const attempt: QuizAttempt = {
      answers: userAnswers,
      score,
      total_points: totalPoints,
      time_taken: timeTaken,
      completed_at: new Date().toISOString(),
    }

    setQuizAttempt(attempt)

    // Save to database
    try {
      const response = await fetch("/api/quiz/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_title: currentQuiz.title,
          score,
          total_points: totalPoints,
          time_taken: timeTaken,
          answers: userAnswers,
          subject_id: currentQuiz.subject_id,
        }),
      })

      if (response.ok) {
        fetchQuizHistory()
        toast({
          title: "Quiz completed",
          description: `Score: ${score}/${totalPoints} (${Math.round((score / totalPoints) * 100)}%)`,
        })
      }
    } catch (error) {
      console.error("Error saving quiz result:", error)
    }

    setActiveTab("results")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id] || ""

    return (
      <Card key={question.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Question {index + 1}
              <Badge variant="secondary" className="ml-2">
                {question.points} {question.points === 1 ? "point" : "points"}
              </Badge>
            </CardTitle>
            <Badge variant="outline">{question.type.replace("_", " ").toUpperCase()}</Badge>
          </div>
          <CardDescription>{question.question}</CardDescription>
        </CardHeader>
        <CardContent>
          {question.type === "mcq" && question.options && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              disabled={!isQuizActive}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                  <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === "true_false" && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              disabled={!isQuizActive}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`}>False</Label>
              </div>
            </RadioGroup>
          )}

          {(question.type === "fill_blank" || question.type === "short_answer") && (
            <Input
              value={userAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              disabled={!isQuizActive}
              className="mt-2"
            />
          )}

          {quizAttempt && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim() ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
                    ? "Correct"
                    : "Incorrect"}
                </span>
              </div>
              <p>
                <strong>Correct Answer:</strong> {question.correct_answer}
              </p>
              {userAnswer && userAnswer !== question.correct_answer && (
                <p>
                  <strong>Your Answer:</strong> {userAnswer}
                </p>
              )}
              {question.explanation && (
                <p className="mt-2">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate interactive quizzes from your study materials and track your progress.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="take" disabled={!currentQuiz} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Take Quiz
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!quizAttempt} className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Input
                </CardTitle>
                <CardDescription>Provide study material to generate quiz questions from.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quiz-title">Quiz Title</Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                  />
                </div>

                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Textarea
                    id="text-content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste your study notes, lecture content, or any text material here..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="file-upload">Or Upload Text File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </div>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Upload className="h-4 w-4 animate-spin" />
                      Extracting...
                    </div>
                  )}
                </div>

                {!textContent.trim() && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Please add some text content to generate quiz questions.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quiz Settings
                </CardTitle>
                <CardDescription>Customize your quiz parameters and difficulty.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="question-count">Questions</Label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz-type">Quiz Type</Label>
                    <Select value={quizType} onValueChange={setQuizType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="mixed">Mixed Types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Select value={timeLimit} onValueChange={setTimeLimit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateQuiz} disabled={isGenerating || !textContent.trim()} className="w-full">
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="take" className="space-y-6">
          {currentQuiz && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{currentQuiz.title}</CardTitle>
                      <CardDescription>
                        {currentQuiz.questions.length} questions • {currentQuiz.total_points} points •
                        {currentQuiz.time_limit} minutes
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      {isQuizActive && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className={`font-mono text-lg ${timeRemaining < 300 ? "text-red-600" : ""}`}>
                              {formatTime(timeRemaining)}
                            </span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isQuizActive && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>
                          {Object.keys(userAnswers).length} / {currentQuiz.questions.length} answered
                        </span>
                      </div>
                      <Progress
                        value={(Object.keys(userAnswers).length / currentQuiz.questions.length) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!isQuizActive && !quizAttempt && (
                    <div className="text-center py-8">
                      <HelpCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
                      <p className="text-gray-600 mb-4">
                        You have {currentQuiz.time_limit} minutes to complete {currentQuiz.questions.length} questions.
                      </p>
                      <Button onClick={startQuiz} size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                  )}

                  {(isQuizActive || quizAttempt) && (
                    <div className="space-y-4">
                      <ScrollArea className="h-[600px]">
                        {currentQuiz.questions.map((question, index) => renderQuestion(question, index))}
                      </ScrollArea>

                      {isQuizActive && (
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            {Object.keys(userAnswers).length} of {currentQuiz.questions.length} questions answered
                          </div>
                          <Button onClick={handleQuizSubmit}>Submit Quiz</Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {quizAttempt && currentQuiz && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Quiz Results
                </CardTitle>
                <CardDescription>Your performance on "{currentQuiz.title}"</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${getScoreColor((quizAttempt.score / quizAttempt.total_points) * 100)}`}
                    >
                      {quizAttempt.score}/{quizAttempt.total_points}
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${getScoreColor((quizAttempt.score / quizAttempt.total_points) * 100)}`}
                    >
                      {Math.round((quizAttempt.score / quizAttempt.total_points) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Percentage</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(quizAttempt.time_taken)}m</div>
                    <div className="text-sm text-gray-600">Time Taken</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        Object.values(quizAttempt.answers).filter(
                          (answer, index) =>
                            answer.toLowerCase().trim() ===
                            currentQuiz.questions[index]?.correct_answer.toLowerCase().trim(),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setQuizAttempt(null)
                      setActiveTab("take")
                    }}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => setActiveTab("generate")}>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiz History
              </CardTitle>
              <CardDescription>Your recent quiz attempts and performance.</CardDescription>
            </CardHeader>
            <CardContent>
              {quizHistory.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quiz history yet</h3>
                  <p className="text-gray-600 mb-4">Start taking quizzes to see your progress here.</p>
                  <Button onClick={() => setActiveTab("generate")}>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Your First Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{result.quiz_title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(result.created_at).toLocaleDateString()} at{" "}
                            {new Date(result.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getScoreColor((result.score / result.total_points) * 100)}`}
                          >
                            {result.score}/{result.total_points}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((result.score / result.total_points) * 100)}% • {Math.round(result.time_taken)}m
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

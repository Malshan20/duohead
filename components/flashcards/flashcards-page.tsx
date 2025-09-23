"use client"

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
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit,
  Play,
  RotateCcw,
  Check,
  X,
  Loader2,
  Sparkles,
  FileText,
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

// First, import the subscription limit utilities
import { hasReachedLimit, type SubscriptionTier } from "@/lib/subscription-limits"

interface Flashcard {
  id: string
  question: string
  answer: string
  subject_id?: string
  document_id?: string
  created_at: string
  updated_at: string
  user_id: string
  difficulty: "easy" | "medium" | "hard"
  last_reviewed?: string
  review_count: number
  correct_count: number
}

interface Subject {
  id: string
  name: string
  color: string
}

interface Document {
  id: string
  title: string
  content: string
}

export function FlashcardsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  // State management
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  // AI Generation state
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiText, setAiText] = useState("")
  const [selectedDocument, setSelectedDocument] = useState("")
  const [aiSubject, setAiSubject] = useState("")
  const [cardCount, setCardCount] = useState(5)
  const [generatingAi, setGeneratingAi] = useState(false)

  // Manual Creation state
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [manualQuestion, setManualQuestion] = useState("")
  const [manualAnswer, setManualAnswer] = useState("")
  const [manualSubject, setManualSubject] = useState("")
  const [manualDifficulty, setManualDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  // Study Mode state
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyStats, setStudyStats] = useState({ correct: 0, total: 0 })

  // Edit state
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Add state for tracking monthly usage and user's tier
  const [monthlyUsage, setMonthlyUsage] = useState({
    flashcards: 0,
  })
  const [userTier, setUserTier] = useState<SubscriptionTier>("Seedling")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      // Fetch flashcards
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (flashcardsError) throw flashcardsError

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase.from("subjects").select("*").order("name")

      if (subjectsError) throw subjectsError

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from("documents")
        .select("id, title, content")
        .eq("user_id", authUser.id)
        .order("title")

      if (documentsError) throw documentsError

      setFlashcards(flashcardsData || [])
      setSubjects(subjectsData || [])
      setDocuments(documentsData || [])

      // Add this to the fetchData function to get the user's tier and monthly usage
      const fetchUserTierAndUsage = async (userId: string) => {
        try {
          // Get user's subscription tier
          const { data: profileData } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .single()

          setUserTier((profileData?.subscription_tier || "Seedling") as SubscriptionTier)

          // Get the first day of the current month
          const now = new Date()
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

          // Count flashcards created this month
          const { count, error } = await supabase
            .from("flashcards")
            .select("id", { count: "exact" })
            .eq("user_id", userId)
            .gte("created_at", firstDayOfMonth.toISOString())

          if (error) throw error

          setMonthlyUsage((prev) => ({
            ...prev,
            flashcards: count || 0,
          }))
        } catch (error) {
          console.error("Error fetching user tier and usage:", error)
        }
      }

      // Call this function in fetchData after getting the user
      if (authUser) {
        await fetchUserTierAndUsage(authUser.id)
      }
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

  const generateAiFlashcards = async () => {
    if (!aiText.trim() && !selectedDocument) {
      toast({
        title: "Missing content",
        description: "Please provide text or select a document.",
        variant: "destructive",
      })
      return
    }

    setGeneratingAi(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let content = aiText
      if (selectedDocument && !aiText.trim()) {
        const doc = documents.find((d) => d.id === selectedDocument)
        if (!doc) {
          throw new Error("Selected document not found")
        }
        content = doc.content || ""
      }

      if (!content.trim()) {
        throw new Error("No content available to generate flashcards from")
      }

      // Modify the generateAiFlashcards function to check limits
      // Add this check after validating content
      if (userTier === "Seedling") {
        // Check if user has reached their monthly limit
        if (hasReachedLimit(userTier, "flashcards_per_month", monthlyUsage.flashcards)) {
          toast({
            title: "Monthly limit reached",
            description: "You've reached your monthly flashcard limit. Upgrade your plan for unlimited flashcards.",
            variant: "destructive",
          })
          return
        }

        // Check if this generation would exceed the limit
        const remainingCards = 20 - monthlyUsage.flashcards
        if (cardCount > remainingCards) {
          toast({
            title: "Limit warning",
            description: `You can only create ${remainingCards} more flashcards this month. Reducing count to ${remainingCards}.`,
          })
          setCardCount(remainingCards)
        }
      }

      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const { flashcards: aiFlashcards } = await response.json()

      if (!Array.isArray(aiFlashcards) || aiFlashcards.length === 0) {
        throw new Error("No flashcards were generated from the content")
      }

      // Limit to requested count
      const limitedCards = aiFlashcards.slice(0, cardCount)

      // Validate flashcards before inserting
      const validCards = limitedCards.filter(
        (card) =>
          card &&
          typeof card.question === "string" &&
          typeof card.answer === "string" &&
          card.question.trim() !== "" &&
          card.answer.trim() !== "",
      )

      if (validCards.length === 0) {
        throw new Error("Generated flashcards are not in the correct format")
      }

      // Insert flashcards into database
      const flashcardsToInsert = validCards.map((card: any) => ({
        question: card.question.trim(),
        answer: card.answer.trim(),
        subject_id: aiSubject || null,
        document_id: selectedDocument || null,
        user_id: user.id,
        difficulty: "medium" as const,
        review_count: 0,
        correct_count: 0,
      }))

      const { error } = await supabase.from("flashcards").insert(flashcardsToInsert)

      if (error) throw error

      toast({
        title: "Flashcards generated!",
        description: `Created ${validCards.length} flashcards successfully.`,
      })

      // Reset form and refresh data
      setAiText("")
      setSelectedDocument("")
      setAiSubject("") // Clear the pre-selected subject
      setCardCount(5)
      setShowAiDialog(false)
      fetchData()
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Error generating flashcards",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setGeneratingAi(false)
    }
  }

  const createManualFlashcard = async () => {
    // Also modify the createManualFlashcard function to check limits
    // Add this check at the beginning of the function
    if (userTier === "Seedling" && hasReachedLimit(userTier, "flashcards_per_month", monthlyUsage.flashcards)) {
      toast({
        title: "Monthly limit reached",
        description: "You've reached your monthly flashcard limit. Upgrade your plan for unlimited flashcards.",
        variant: "destructive",
      })
      return
    }

    if (!manualQuestion.trim() || !manualAnswer.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both question and answer.",
        variant: "destructive",
      })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("flashcards").insert({
        question: manualQuestion.trim(),
        answer: manualAnswer.trim(),
        subject_id: manualSubject || null,
        user_id: user.id,
        difficulty: manualDifficulty,
        review_count: 0,
        correct_count: 0,
      })

      if (error) throw error

      toast({
        title: "Flashcard created!",
        description: "Your flashcard has been added successfully.",
      })

      // Reset form and refresh data
      setManualQuestion("")
      setManualAnswer("")
      setManualSubject("") // Clear the pre-selected subject
      setManualDifficulty("medium")
      setShowManualDialog(false)
      fetchData()
    } catch (error) {
      console.error("Error creating flashcard:", error)
      toast({
        title: "Error creating flashcard",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const updateFlashcard = async () => {
    if (!editingCard || !editingCard.question.trim() || !editingCard.answer.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both question and answer.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("flashcards")
        .update({
          question: editingCard.question.trim(),
          answer: editingCard.answer.trim(),
          difficulty: editingCard.difficulty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCard.id)

      if (error) throw error

      toast({
        title: "Flashcard updated!",
        description: "Your changes have been saved.",
      })

      setEditingCard(null)
      setShowEditDialog(false)
      fetchData()
    } catch (error) {
      console.error("Error updating flashcard:", error)
      toast({
        title: "Error updating flashcard",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase.from("flashcards").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Flashcard deleted",
        description: "The flashcard has been removed.",
      })

      fetchData()
    } catch (error) {
      console.error("Error deleting flashcard:", error)
      toast({
        title: "Error deleting flashcard",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const startStudySession = (cards: Flashcard[]) => {
    if (cards.length === 0) {
      toast({
        title: "No flashcards",
        description: "Please create some flashcards first.",
        variant: "destructive",
      })
      return
    }

    setStudyCards([...cards].sort(() => Math.random() - 0.5)) // Shuffle cards
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setStudyStats({ correct: 0, total: 0 })
    setShowStudyMode(true)
  }

  const handleStudyAnswer = async (correct: boolean) => {
    const currentCard = studyCards[currentCardIndex]

    try {
      // Update card statistics
      await supabase
        .from("flashcards")
        .update({
          review_count: currentCard.review_count + 1,
          correct_count: correct ? currentCard.correct_count + 1 : currentCard.correct_count,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", currentCard.id)

      setStudyStats((prev) => ({
        correct: correct ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
      }))

      // Move to next card or finish session
      if (currentCardIndex < studyCards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1)
        setShowAnswer(false)
      } else {
        // Session complete
        toast({
          title: "Study session complete!",
          description: `You got ${studyStats.correct + (correct ? 1 : 0)} out of ${studyCards.length} correct.`,
        })
        setShowStudyMode(false)
        fetchData() // Refresh to show updated stats
      }
    } catch (error) {
      console.error("Error updating card stats:", error)
    }
  }

  // Filter flashcards
  const filteredFlashcards = flashcards.filter((card) => {
    const matchesSearch =
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSubject = selectedSubject === "all" || card.subject_id === selectedSubject

    return matchesSearch && matchesSubject
  })

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and study with AI-generated or manual flashcards.
          </p>
          {userTier === "Seedling" && (
            <p className="text-sm text-gray-500 mt-1">{monthlyUsage.flashcards}/20 flashcards used this month</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Pre-select subject if filtering by specific subject
              if (selectedSubject !== "all") {
                setAiSubject(selectedSubject)
              }
              setShowAiDialog(true)
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generate
          </Button>
          <Button
            onClick={() => {
              // Pre-select subject if filtering by specific subject
              if (selectedSubject !== "all") {
                setManualSubject(selectedSubject)
              }
              setShowManualDialog(true)
            }}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Manual Create
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filteredFlashcards.length > 0 && (
          <Button onClick={() => startStudySession(filteredFlashcards)} className="bg-green-600 hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" />
            Study ({filteredFlashcards.length})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {flashcards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
              <p className="text-sm text-gray-600">Total Cards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {flashcards.filter((c) => c.review_count > 0).length}
              </div>
              <p className="text-sm text-gray-600">Reviewed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  flashcards.reduce(
                    (acc, card) => acc + (card.review_count > 0 ? (card.correct_count / card.review_count) * 100 : 0),
                    0,
                  ) / flashcards.filter((c) => c.review_count > 0).length || 0,
                )}
                %
              </div>
              <p className="text-sm text-gray-600">Accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{subjects.length}</div>
              <p className="text-sm text-gray-600">Subjects</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flashcards Grid */}
      {filteredFlashcards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first flashcard using AI generation or manual creation.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => {
                  // Pre-select subject if filtering by specific subject
                  if (selectedSubject !== "all") {
                    setAiSubject(selectedSubject)
                  }
                  setShowAiDialog(true)
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
              <Button
                onClick={() => {
                  // Pre-select subject if filtering by specific subject
                  if (selectedSubject !== "all") {
                    setManualSubject(selectedSubject)
                  }
                  setShowManualDialog(true)
                }}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Manual Create
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlashcards.map((card) => {
            const subject = subjects.find((s) => s.id === card.subject_id)
            const accuracy = card.review_count > 0 ? Math.round((card.correct_count / card.review_count) * 100) : 0

            return (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
                        {subject && (
                          <Badge variant="outline" style={{ borderColor: subject.color, color: subject.color }}>
                            {subject.name}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-medium line-clamp-2">{card.question}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCard(card)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFlashcard(card.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{card.answer}</p>
                  {card.review_count > 0 && (
                    <div className="text-xs text-gray-500">
                      Reviewed {card.review_count} times • {accuracy}% accuracy
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* AI Generation Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Flashcard Generator
            </DialogTitle>
            <DialogDescription>
              Generate flashcards automatically from your text or documents using AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">From Text</TabsTrigger>
                <TabsTrigger value="document">From Document</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="ai-text">Text Content</Label>
                  <Textarea
                    id="ai-text"
                    placeholder="Paste your study material here..."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="document" className="space-y-4">
                <div>
                  <Label htmlFor="document-select">Select Document</Label>
                  <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a document" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {doc.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-count">Number of Cards</Label>
                <Select value={cardCount.toString()} onValueChange={(value) => setCardCount(Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 8, 10, 15, 20].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} cards
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ai-subject">Subject (Optional)</Label>
                <Select value={aiSubject} onValueChange={setAiSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedSubject !== "all" && (
              <p className="text-xs text-gray-500 mt-1">
                Auto-selected based on current filter. You can change this if needed.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAiDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateAiFlashcards} disabled={generatingAi}>
              {generatingAi ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Creation Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Flashcard</DialogTitle>
            <DialogDescription>Manually create a new flashcard with custom question and answer.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-question">Question</Label>
              <Textarea
                id="manual-question"
                placeholder="Enter your question..."
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="manual-answer">Answer</Label>
              <Textarea
                id="manual-answer"
                placeholder="Enter the answer..."
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-difficulty">Difficulty</Label>
                <Select
                  value={manualDifficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setManualDifficulty(value)}
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

              <div>
                <Label htmlFor="manual-subject">Subject (Optional)</Label>
                <Select value={manualSubject} onValueChange={setManualSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedSubject !== "all" && (
              <p className="text-xs text-gray-500 mt-1">
                Auto-selected based on current filter. You can change this if needed.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createManualFlashcard}>
              <Plus className="mr-2 h-4 w-4" />
              Create Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>Update the question, answer, or difficulty of this flashcard.</DialogDescription>
          </DialogHeader>

          {editingCard && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-question">Question</Label>
                <Textarea
                  id="edit-question"
                  value={editingCard.question}
                  onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-answer">Answer</Label>
                <Textarea
                  id="edit-answer"
                  value={editingCard.answer}
                  onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={editingCard.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setEditingCard({ ...editingCard, difficulty: value })
                  }
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateFlashcard}>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Study Mode Dialog */}
      <Dialog open={showStudyMode} onOpenChange={setShowStudyMode}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Study Session</span>
              <Badge variant="outline">
                {currentCardIndex + 1} / {studyCards.length}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Progress: {studyStats.correct} correct out of {studyStats.total} answered
            </DialogDescription>
          </DialogHeader>

          {studyCards.length > 0 && (
            <div className="space-y-6">
              <Progress value={((currentCardIndex + 1) / studyCards.length) * 100} className="h-2" />

              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-500">Question</div>
                  <div className="text-lg font-medium">{studyCards[currentCardIndex]?.question}</div>

                  {showAnswer && (
                    <>
                      <div className="border-t pt-4">
                        <div className="text-sm text-gray-500 mb-2">Answer</div>
                        <div className="text-base text-gray-700 dark:text-gray-300">
                          {studyCards[currentCardIndex]?.answer}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} className="w-32">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Show Answer
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleStudyAnswer(false)}
                      variant="outline"
                      className="w-32 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Incorrect
                    </Button>
                    <Button onClick={() => handleStudyAnswer(true)} className="w-32 bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Correct
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudyMode(false)}>
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

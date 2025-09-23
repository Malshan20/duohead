"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CalendarIcon, CheckCircle2, Clock, Lightbulb, Plus, Trash2, Brain } from "lucide-react"
import { format, addDays, differenceInDays, isBefore } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

type StudyPlan = {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  is_completed: boolean
  subject_name: string
  user_id: string
}

type StudyGoal = {
  id: string
  study_plan_id: string
  title: string
  description: string
  due_date: string
  created_at: string
  updated_at: string
  is_completed: boolean
  priority: "low" | "medium" | "high"
  estimated_hours: number
  user_id: string
}

export function StudyPlannerPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [userId, setUserId] = useState<string | null>(null)

  // New plan form state
  const [showNewPlanForm, setShowNewPlanForm] = useState(false)
  const [planTitle, setPlanTitle] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [planSubject, setPlanSubject] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [aiSuggestions, setAiSuggestions] = useState<StudyGoal[]>([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false)

  // New goal form state
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [goalTitle, setGoalTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [goalDueDate, setGoalDueDate] = useState<Date | undefined>(new Date())
  const [goalPriority, setGoalPriority] = useState<"low" | "medium" | "high">("medium")
  const [goalHours, setGoalHours] = useState(1)

  useEffect(() => {
    const fetchUserAndPlans = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)
          fetchStudyPlans(user.id)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setLoading(false)
      }
    }

    fetchUserAndPlans()
  }, [])

  async function fetchStudyPlans(uid: string) {
    try {
      setLoading(true)

      const { data: plans, error: plansError } = await supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", uid)
        .order("start_date", { ascending: true })

      if (plansError) throw plansError

      if (plans && plans.length > 0) {
        setStudyPlans(plans)

        const { data: goals, error: goalsError } = await supabase
          .from("study_goals")
          .select("*")
          .in(
            "study_plan_id",
            plans.map((plan) => plan.id),
          )
          .order("is_completed", { ascending: true })
          .order("due_date", { ascending: true })

        if (goalsError) throw goalsError
        setStudyGoals(goals || [])
      } else {
        setStudyPlans([])
        setStudyGoals([])
      }
    } catch (error) {
      console.error("Error fetching study plans:", error)
      toast({
        title: "Error fetching study plans",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function generateAiStudyPlan() {
    if (!planTitle || !startDate || !endDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title and dates to get AI suggestions.",
        variant: "destructive",
      })
      return
    }

    setGeneratingSuggestions(true)

    try {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: planSubject || planTitle,
          examDate: endDate.toISOString(),
          currentLevel: "intermediate",
          startDate: startDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI study plan")
      }

      const { studyPlan } = await response.json()

      // Convert AI response to our format
      const suggestions: StudyGoal[] = studyPlan.goals.map((goal: any, index: number) => ({
        id: `temp-${index}`,
        study_plan_id: "temp",
        title: goal.title,
        description: goal.description,
        due_date: addDays(
          startDate!,
          Math.floor((index + 1) * (differenceInDays(endDate!, startDate!) / studyPlan.goals.length)),
        ).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_completed: false,
        priority: goal.priority || "medium",
        estimated_hours: goal.estimatedHours || 2,
        user_id: userId || "",
      }))

      setAiSuggestions(suggestions)
      setShowAiSuggestions(true)

      toast({
        title: "AI Study Plan Generated",
        description: `Generated ${suggestions.length} study goals for your plan.`,
      })
    } catch (error) {
      console.error("Error generating AI study plan:", error)

      // Fallback to manual suggestions if AI fails
      generateManualSuggestions()
    } finally {
      setGeneratingSuggestions(false)
    }
  }

  function generateManualSuggestions() {
    if (!planTitle || !startDate || !endDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields to get suggestions.",
        variant: "destructive",
      })
      return
    }

    const daysBetween = differenceInDays(endDate!, startDate!)
    const suggestions: StudyGoal[] = []

    // Generate a study plan based on the number of days available
    if (daysBetween <= 7) {
      // Short-term plan (1 week or less)
      suggestions.push(
        {
          id: "temp-1",
          study_plan_id: "temp",
          title: "Initial content review",
          description: "Review all course materials and identify key topics",
          due_date: addDays(startDate!, 1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 2,
          user_id: userId || "",
        },
        {
          id: "temp-2",
          study_plan_id: "temp",
          title: "Create summary notes",
          description: "Condense key information into concise notes",
          due_date: addDays(startDate!, 2).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 3,
          user_id: userId || "",
        },
        {
          id: "temp-3",
          study_plan_id: "temp",
          title: "Practice with sample questions",
          description: "Work through practice problems or past exams",
          due_date: addDays(startDate!, 4).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 2,
          user_id: userId || "",
        },
        {
          id: "temp-4",
          study_plan_id: "temp",
          title: "Final review session",
          description: "Comprehensive review of all materials",
          due_date: addDays(endDate!, -1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 3,
          user_id: userId || "",
        },
      )
    } else if (daysBetween <= 14) {
      // Medium-term plan (1-2 weeks)
      suggestions.push(
        {
          id: "temp-1",
          study_plan_id: "temp",
          title: "Create study outline",
          description: "Organize all topics and create a detailed study plan",
          due_date: addDays(startDate!, 1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 1,
          user_id: userId || "",
        },
        {
          id: "temp-2",
          study_plan_id: "temp",
          title: "Review first third of content",
          description: "Deep dive into the first section of material",
          due_date: addDays(startDate!, 3).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 3,
          user_id: userId || "",
        },
        {
          id: "temp-3",
          study_plan_id: "temp",
          title: "Review second third of content",
          description: "Deep dive into the middle section of material",
          due_date: addDays(startDate!, 6).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 3,
          user_id: userId || "",
        },
        {
          id: "temp-4",
          study_plan_id: "temp",
          title: "Review final third of content",
          description: "Deep dive into the final section of material",
          due_date: addDays(startDate!, 9).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 3,
          user_id: userId || "",
        },
        {
          id: "temp-5",
          study_plan_id: "temp",
          title: "Practice exam simulation",
          description: "Complete a timed practice exam under test conditions",
          due_date: addDays(startDate!, 11).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 2,
          user_id: userId || "",
        },
        {
          id: "temp-6",
          study_plan_id: "temp",
          title: "Review weak areas",
          description: "Focus on topics that need more attention based on practice results",
          due_date: addDays(endDate!, -2).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 2,
          user_id: userId || "",
        },
        {
          id: "temp-7",
          study_plan_id: "temp",
          title: "Final comprehensive review",
          description: "Quick review of all material with focus on key concepts",
          due_date: addDays(endDate!, -1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 3,
          user_id: userId || "",
        },
      )
    } else {
      // Long-term plan (more than 2 weeks)
      const weeklyReviews = Math.floor(daysBetween / 7)

      // Initial planning phase
      suggestions.push(
        {
          id: "temp-1",
          study_plan_id: "temp",
          title: "Create detailed study schedule",
          description: "Break down all topics and allocate specific study times",
          due_date: addDays(startDate!, 2).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 2,
          user_id: userId || "",
        },
        {
          id: "temp-2",
          study_plan_id: "temp",
          title: "Gather all study materials",
          description: "Collect textbooks, notes, practice exams, and online resources",
          due_date: addDays(startDate!, 3).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 1,
          user_id: userId || "",
        },
      )

      // Weekly review goals
      for (let i = 1; i <= weeklyReviews; i++) {
        suggestions.push({
          id: `temp-${i + 2}`,
          study_plan_id: "temp",
          title: `Week ${i} content review`,
          description: `Complete review of week ${i} material and practice problems`,
          due_date: addDays(startDate!, i * 7).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "medium",
          estimated_hours: 5,
          user_id: userId || "",
        })
      }

      // Final preparation phase
      suggestions.push(
        {
          id: `temp-${weeklyReviews + 3}`,
          study_plan_id: "temp",
          title: "Complete practice exam",
          description: "Take a full practice exam under timed conditions",
          due_date: addDays(endDate!, -7).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 3,
          user_id: userId || "",
        },
        {
          id: `temp-${weeklyReviews + 4}`,
          study_plan_id: "temp",
          title: "Review weak areas",
          description: "Focus on topics that need improvement based on practice results",
          due_date: addDays(endDate!, -4).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 4,
          user_id: userId || "",
        },
        {
          id: `temp-${weeklyReviews + 5}`,
          study_plan_id: "temp",
          title: "Final review session",
          description: "Comprehensive review of all materials",
          due_date: addDays(endDate!, -1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
          priority: "high",
          estimated_hours: 3,
          user_id: userId || "",
        },
      )
    }

    setAiSuggestions(suggestions)
    setShowAiSuggestions(true)
  }

  async function createStudyPlan(useAiSuggestions = false) {
    if (!planTitle || !startDate || !endDate || !userId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (isBefore(endDate, startDate)) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: plan, error } = await supabase
        .from("study_plans")
        .insert({
          title: planTitle,
          description: planDescription,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          subject_name: planSubject,
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Study plan created",
        description: "Your study plan has been created successfully.",
      })

      // If using AI suggestions, add the suggested goals
      if (useAiSuggestions && aiSuggestions.length > 0) {
        const goalsToInsert = aiSuggestions.map((goal) => ({
          study_plan_id: plan.id,
          title: goal.title,
          description: goal.description,
          due_date: goal.due_date,
          priority: goal.priority,
          estimated_hours: goal.estimated_hours,
          user_id: userId,
        }))

        const { error: goalsError } = await supabase.from("study_goals").insert(goalsToInsert)

        if (goalsError) throw goalsError
      }

      // Reset form and fetch updated data
      resetPlanForm()
      fetchStudyPlans(userId)
    } catch (error) {
      console.error("Error creating study plan:", error)
      toast({
        title: "Error creating study plan",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function createStudyGoal() {
    if (!goalTitle || !selectedPlanId || !goalDueDate || !userId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("study_goals").insert({
        study_plan_id: selectedPlanId,
        title: goalTitle,
        description: goalDescription,
        due_date: goalDueDate.toISOString(),
        priority: goalPriority,
        estimated_hours: goalHours,
        user_id: userId,
      })

      if (error) throw error

      toast({
        title: "Study goal created",
        description: "Your study goal has been created successfully.",
      })

      // Reset form and fetch updated data
      resetGoalForm()
      fetchStudyPlans(userId)
    } catch (error) {
      console.error("Error creating study goal:", error)
      toast({
        title: "Error creating study goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function toggleGoalCompletion(goalId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase.from("study_goals").update({ is_completed: !currentStatus }).eq("id", goalId)

      if (error) throw error

      // Update local state and move completed goals to bottom
      setStudyGoals((prevGoals) => {
        const updatedGoals = prevGoals.map((goal) =>
          goal.id === goalId ? { ...goal, is_completed: !currentStatus } : goal,
        )

        // Sort goals: incomplete first, then completed
        return updatedGoals.sort((a, b) => {
          if (a.is_completed === b.is_completed) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          }
          return a.is_completed ? 1 : -1
        })
      })

      // Check if all goals in the plan are completed
      const updatedGoal = studyGoals.find((g) => g.id === goalId)
      if (updatedGoal) {
        const planGoals = studyGoals.filter((g) => g.study_plan_id === updatedGoal.study_plan_id)
        const allCompleted = planGoals.every((g) => (g.id === goalId ? !currentStatus : g.is_completed))

        if (allCompleted) {
          // Update plan completion status in database
          await supabase.from("study_plans").update({ is_completed: true }).eq("id", updatedGoal.study_plan_id)

          // Update local state - this will move the plan to completed section
          setStudyPlans((prevPlans) =>
            prevPlans.map((plan) => (plan.id === updatedGoal.study_plan_id ? { ...plan, is_completed: true } : plan)),
          )

          // Show success message
          toast({
            title: "Study Plan Completed! 🎉",
            description: "Congratulations! You've completed all goals in this study plan.",
          })
        }
      }
    } catch (error) {
      console.error("Error updating goal status:", error)
      toast({
        title: "Error updating goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function deleteStudyPlan(planId: string) {
    try {
      // Delete all goals associated with this plan
      const { error: goalsError } = await supabase.from("study_goals").delete().eq("study_plan_id", planId)

      if (goalsError) throw goalsError

      // Delete the plan
      const { error: planError } = await supabase.from("study_plans").delete().eq("id", planId)

      if (planError) throw planError

      toast({
        title: "Study plan deleted",
        description: "Your study plan has been deleted successfully.",
      })

      // Update local state
      setStudyPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId))
      setStudyGoals((prevGoals) => prevGoals.filter((goal) => goal.study_plan_id !== planId))
    } catch (error) {
      console.error("Error deleting study plan:", error)
      toast({
        title: "Error deleting study plan",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function deleteStudyGoal(goalId: string) {
    try {
      const { error } = await supabase.from("study_goals").delete().eq("id", goalId)

      if (error) throw error

      toast({
        title: "Study goal deleted",
        description: "Your study goal has been deleted successfully.",
      })

      // Update local state
      setStudyGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId))
    } catch (error) {
      console.error("Error deleting study goal:", error)
      toast({
        title: "Error deleting study goal",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  function resetPlanForm() {
    setPlanTitle("")
    setPlanDescription("")
    setPlanSubject("")
    setStartDate(new Date())
    setEndDate(addDays(new Date(), 14))
    setShowNewPlanForm(false)
    setShowAiSuggestions(false)
    setAiSuggestions([])
  }

  function resetGoalForm() {
    setGoalTitle("")
    setGoalDescription("")
    setGoalDueDate(new Date())
    setGoalPriority("medium")
    setGoalHours(1)
    setShowNewGoalForm(false)
    setSelectedPlanId(null)
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  function getCompletionPercentage(planId: string) {
    const planGoals = studyGoals.filter((goal) => goal.study_plan_id === planId)
    if (planGoals.length === 0) return 0

    const completedGoals = planGoals.filter((goal) => goal.is_completed)
    return Math.round((completedGoals.length / planGoals.length) * 100)
  }

  // Filter plans based on active tab
  const filteredPlans = studyPlans.filter((plan) => {
    const now = new Date()
    if (activeTab === "upcoming") {
      // Show plans that are not completed, regardless of end date
      return !plan.is_completed
    } else if (activeTab === "completed") {
      // Show only completed plans
      return plan.is_completed
    } else if (activeTab === "past") {
      // Show plans that are past due but not completed
      return isBefore(new Date(plan.end_date), now) && !plan.is_completed
    }
    return true
  })

  if (!userId && loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create AI-powered study plans and track your progress towards your goals.
          </p>
        </div>
        <Button onClick={() => setShowNewPlanForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Study Plan
        </Button>
      </div>

      {/* New Plan Dialog */}
      <Dialog open={showNewPlanForm} onOpenChange={setShowNewPlanForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Study Plan</DialogTitle>
            <DialogDescription>Set up a new study plan with goals and deadlines.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan-title">Plan Title</Label>
              <Input
                id="plan-title"
                placeholder="e.g., Final Exam Preparation"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan-subject">Subject (Optional)</Label>
              <Input
                id="plan-subject"
                placeholder="e.g., Mathematics"
                value={planSubject}
                onChange={(e) => setPlanSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan-description">Description (Optional)</Label>
              <Textarea
                id="plan-description"
                placeholder="Describe your study plan..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <div className="border rounded-md p-2 overflow-x-auto study-planner">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="mx-auto"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <div className="border rounded-md p-2 overflow-x-auto study-planner">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="mx-auto" />
                </div>
              </div>
            </div>

            {!showAiSuggestions && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generateAiStudyPlan}
                  disabled={generatingSuggestions}
                  className="flex-1"
                >
                  {generatingSuggestions ? (
                    <>Generating AI Plan...</>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      AI Study Plan
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={generateManualSuggestions}
                  disabled={generatingSuggestions}
                  className="flex-1"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Manual Suggestions
                </Button>
              </div>
            )}

            {showAiSuggestions && (
              <div className="mt-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Study Plan Suggestions</AlertTitle>
                  <AlertDescription>
                    Based on your timeframe ({differenceInDays(endDate!, startDate!)} days), here's a suggested study
                    plan with {aiSuggestions.length} goals.
                  </AlertDescription>
                </Alert>

                <div className="mt-4 max-h-60 overflow-y-auto border rounded-md p-2">
                  {aiSuggestions.map((goal, index) => (
                    <div key={goal.id} className="py-2 border-b last:border-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="mb-1 sm:mb-0">
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-gray-500">{goal.description}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                          <span className="ml-2 text-sm text-gray-500">{format(new Date(goal.due_date), "MMM d")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={resetPlanForm} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => createStudyPlan(false)} className="w-full sm:w-auto">
              Create Plan
            </Button>
            {showAiSuggestions && (
              <Button onClick={() => createStudyPlan(true)} className="w-full sm:w-auto">
                Create with Suggestions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoalForm} onOpenChange={setShowNewGoalForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Study Goal</DialogTitle>
            <DialogDescription>Create a new goal for your study plan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g., Complete Chapter 5"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal-description">Description (Optional)</Label>
              <Textarea
                id="goal-description"
                placeholder="Describe your study goal..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <div className="border rounded-md p-2 study-planner">
                <Calendar mode="single" selected={goalDueDate} onSelect={setGoalDueDate} initialFocus />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-priority">Priority</Label>
                <Select
                  value={goalPriority}
                  onValueChange={(value: "low" | "medium" | "high") => setGoalPriority(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goal-hours">Estimated Hours</Label>
                <Input
                  id="goal-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={goalHours}
                  onChange={(e) => setGoalHours(Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={resetGoalForm} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={createStudyGoal} className="w-full sm:w-auto">
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Due</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No upcoming study plans</h3>
              <p className="text-gray-500 mt-2">Create a new study plan to get started.</p>
              <Button onClick={() => setShowNewPlanForm(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> New Study Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPlans.map((plan) => {
                const planGoals = studyGoals.filter((goal) => goal.study_plan_id === plan.id)
                const completionPercentage = getCompletionPercentage(plan.id)

                return (
                  <Card key={plan.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.title}</CardTitle>
                          <CardDescription>
                            {plan.subject_name && (
                              <Badge variant="outline" className="mr-2">
                                {plan.subject_name}
                              </Badge>
                            )}
                            <span className="flex items-center text-sm">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {format(new Date(plan.start_date), "MMM d")} -{" "}
                              {format(new Date(plan.end_date), "MMM d, yyyy")}
                            </span>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudyPlan(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {plan.description && <p className="text-sm text-gray-500 mb-4">{plan.description}</p>}

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{completionPercentage}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Goals</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedPlanId(plan.id)
                              setShowNewGoalForm(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Goal
                          </Button>
                        </div>

                        {planGoals.length === 0 ? (
                          <p className="text-sm text-gray-500">No goals added yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {planGoals.map((goal) => (
                              <div key={goal.id} className="flex items-start justify-between p-2 border rounded-md">
                                <div className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`goal-${goal.id}`}
                                    checked={goal.is_completed}
                                    onCheckedChange={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`goal-${goal.id}`}
                                      className={`font-medium ${goal.is_completed ? "line-through text-gray-400" : ""}`}
                                    >
                                      {goal.title}
                                    </Label>
                                    {goal.description && (
                                      <p className={`text-sm ${goal.is_completed ? "text-gray-400" : "text-gray-500"}`}>
                                        {goal.description}
                                      </p>
                                    )}
                                    <div className="flex items-center mt-1 space-x-2">
                                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                        {format(new Date(goal.due_date), "MMM d")}
                                      </span>
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {goal.estimated_hours} hr{goal.estimated_hours !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deleteStudyGoal(goal.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No past due study plans</h3>
              <p className="text-gray-500 mt-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPlans.map((plan) => {
                const planGoals = studyGoals.filter((goal) => goal.study_plan_id === plan.id)
                const completionPercentage = getCompletionPercentage(plan.id)

                return (
                  <Card key={plan.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {plan.title}
                            <Badge variant="destructive" className="ml-2">
                              Past Due
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {plan.subject_name && (
                              <Badge variant="outline" className="mr-2">
                                {plan.subject_name}
                              </Badge>
                            )}
                            <span className="flex items-center text-sm">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {format(new Date(plan.start_date), "MMM d")} -{" "}
                              {format(new Date(plan.end_date), "MMM d, yyyy")}
                            </span>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudyPlan(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Past Due</AlertTitle>
                        <AlertDescription>
                          This study plan has expired. Consider updating the end date or marking it as completed.
                        </AlertDescription>
                      </Alert>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{completionPercentage}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Goals</h4>
                        {planGoals.length === 0 ? (
                          <p className="text-sm text-gray-500">No goals added.</p>
                        ) : (
                          <div className="space-y-2">
                            {planGoals.map((goal) => (
                              <div key={goal.id} className="flex items-start justify-between p-2 border rounded-md">
                                <div className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`goal-${goal.id}`}
                                    checked={goal.is_completed}
                                    onCheckedChange={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`goal-${goal.id}`}
                                      className={`font-medium ${goal.is_completed ? "line-through text-gray-400" : ""}`}
                                    >
                                      {goal.title}
                                    </Label>
                                    {goal.description && (
                                      <p className={`text-sm ${goal.is_completed ? "text-gray-400" : "text-gray-500"}`}>
                                        {goal.description}
                                      </p>
                                    )}
                                    <div className="flex items-center mt-1 space-x-2">
                                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                        {format(new Date(goal.due_date), "MMM d")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deleteStudyGoal(goal.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No completed study plans</h3>
              <p className="text-gray-500 mt-2">Complete your study goals to see them here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPlans.map((plan) => {
                const planGoals = studyGoals.filter((goal) => goal.study_plan_id === plan.id)

                return (
                  <Card key={plan.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {plan.title}
                            <Badge className="ml-2 bg-green-100 text-green-800">Completed</Badge>
                          </CardTitle>
                          <CardDescription>
                            {plan.subject_name && (
                              <Badge variant="outline" className="mr-2">
                                {plan.subject_name}
                              </Badge>
                            )}
                            <span className="flex items-center text-sm">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {format(new Date(plan.start_date), "MMM d")} -{" "}
                              {format(new Date(plan.end_date), "MMM d, yyyy")}
                            </span>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudyPlan(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Completed</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Congratulations on completing this study plan!
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <h4 className="font-medium">Completed Goals</h4>
                        {planGoals.length === 0 ? (
                          <p className="text-sm text-gray-500">No goals were added to this plan.</p>
                        ) : (
                          <div className="space-y-2">
                            {planGoals.map((goal) => (
                              <div
                                key={goal.id}
                                className="flex items-start justify-between p-2 border rounded-md bg-gray-50"
                              >
                                <div className="flex items-start space-x-2">
                                  <Checkbox id={`goal-${goal.id}`} checked={true} disabled className="mt-1" />
                                  <div>
                                    <Label
                                      htmlFor={`goal-${goal.id}`}
                                      className="font-medium line-through text-gray-400"
                                    >
                                      {goal.title}
                                    </Label>
                                    {goal.description && <p className="text-sm text-gray-400">{goal.description}</p>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

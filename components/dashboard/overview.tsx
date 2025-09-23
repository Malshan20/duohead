"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, Calendar, TrendingUp, Upload, Clock, Target, Award } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalFlashcards: 0,
    studyGoals: 0,
    completedGoals: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Fetch documents count
        const { count: documentsCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Fetch flashcards count
        const { count: flashcardsCount } = await supabase
          .from("flashcards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Fetch study goals
        const { data: goals, count: goalsCount } = await supabase
          .from("study_goals")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)

        const completedGoalsCount = goals?.filter((goal) => goal.is_completed).length || 0

        setStats({
          totalDocuments: documentsCount || 0,
          totalFlashcards: flashcardsCount || 0,
          studyGoals: goalsCount || 0,
          completedGoals: completedGoalsCount,
          recentActivity: [],
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const quickActions = [
    {
      title: "Upload Document",
      description: "Add new study materials",
      icon: Upload,
      href: "/dashboard/upload",
      color: "bg-blue-500",
    },
    {
      title: "Study Materials",
      description: "Review your documents",
      icon: BookOpen,
      href: "/dashboard/materials",
      color: "bg-green-500",
    },
    {
      title: "Create Study Plan",
      description: "Plan your learning",
      icon: Calendar,
      href: "/dashboard/planner",
      color: "bg-purple-500",
    },
    {
      title: "Practice Quiz",
      description: "Test your knowledge",
      icon: Brain,
      href: "/dashboard/quiz",
      color: "bg-orange-500",
    },
  ]

  const progressPercentage = stats.studyGoals > 0 ? (stats.completedGoals / stats.studyGoals) * 100 : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Your Duoheads! 🧠</h1>
        <p className="text-green-100">Your AI-powered learning companion is ready to help you excel in your studies.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Study materials uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
            <p className="text-xs text-muted-foreground">AI-generated study cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedGoals}/{stats.studyGoals}
            </div>
            <p className="text-xs text-muted-foreground">Goals completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Your Learning Progress
          </CardTitle>
          <CardDescription>Track your study goals and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Study Goals Completed</span>
              <span>
                {stats.completedGoals} of {stats.studyGoals}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          {stats.studyGoals === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No study goals yet. Create your first study plan!</p>
              <Link href="/dashboard/planner">
                <Button>Create Study Plan</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by uploading your first document!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Copy, ListChecks, FileText, BookOpen, GraduationCap } from "lucide-react"

// First, import the subscription limit utilities
import type { SubscriptionTier } from "@/lib/subscription-limits"
import { createClient } from "@/lib/supabase/client"

type SummaryType = "bullet" | "detailed" | "eli5" | "study"

interface SummaryOption {
  id: SummaryType
  name: string
  description: string
  icon: React.ElementType
}

const summaryOptions: SummaryOption[] = [
  {
    id: "bullet",
    name: "Bullet Points",
    description: "Key points in an easy-to-scan format",
    icon: ListChecks,
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Comprehensive summary with context",
    icon: FileText,
  },
  {
    id: "eli5",
    name: "Explain Like I'm 5",
    description: "Simple explanation anyone can understand",
    icon: BookOpen,
  },
  {
    id: "study",
    name: "Study Notes",
    description: "Structured notes for exam preparation",
    icon: GraduationCap,
  },
]

export function AISummarizerPage() {
  const [text, setText] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<SummaryType>("bullet")
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)

  // Add state for the user's subscription tier
  const [tier, setTier] = useState<SubscriptionTier>("Seedling")
  const supabase = createClient()

  // Add a useEffect to fetch the user's subscription tier
  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()

        setTier((data?.subscription_tier || "Seedling") as SubscriptionTier)
      } catch (error) {
        console.error("Error fetching user tier:", error)
      }
    }

    fetchUserTier()
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to summarize",
        variant: "destructive",
      })
      return
    }

    // Modify the handleSummarize function to check character limits for Seedling users
    // Add this check after validating that text is not empty
    if (tier === "Seedling" && text.length > 2000) {
      toast({
        title: "Character limit exceeded",
        description: "Seedling plan is limited to 2,000 characters. Please upgrade your plan for longer summaries.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSummary("")

    try {
      const response = await fetch("/api/ai/smart-summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          type: activeTab,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setSummary(data.summary)

      // Scroll to results
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error) {
      console.error("Summarization error:", error)
      toast({
        title: "Summarization failed",
        description: "There was an error generating your summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    toast({
      title: "Copied to clipboard",
      description: "Summary has been copied to your clipboard",
    })
  }

  // Add a character count indicator that shows the limit for Seedling users
  // Modify the getCharacterCountColor function
  const getCharacterCountColor = () => {
    const length = text.length
    if (length === 0) return "text-gray-400"
    if (tier === "Seedling" && length > 2000) return "text-red-500"
    if (length < 100) return "text-yellow-500"
    if (length > 5000) return "text-red-500"
    return "text-green-500"
  }

  const estimateReadingTime = () => {
    const words = text.trim().split(/\s+/).length
    const minutes = Math.ceil(words / 200) // Average reading speed
    return minutes === 1 ? "1 minute" : `${minutes} minutes`
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-2">Smart AI Summarizer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform any text into concise summaries with different styles
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-green-100 dark:border-green-900">
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Paste the text you want to summarize</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your text here... (articles, documents, notes, etc.)"
              className="min-h-[200px] resize-y"
              value={text}
              onChange={handleTextChange}
            />
            {/* Update the character count display */}
            <div className="flex justify-between mt-2 text-sm">
              <span className={getCharacterCountColor()}>
                {text.length} characters
                {tier === "Seedling" && ` / 2,000 limit`}
              </span>
              <span className="text-gray-500">~{estimateReadingTime()} read</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SummaryType)} className="w-full">
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-1 h-auto p-1">
                {summaryOptions.map((option) => (
                  <TabsTrigger
                    key={option.id}
                    value={option.id}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 h-auto min-h-[60px] sm:min-h-[40px] text-xs sm:text-sm"
                  >
                    <option.icon className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-center leading-tight">{option.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {summaryOptions.map((option) => (
                <TabsContent key={option.id} value={option.id} className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </TabsContent>
              ))}
            </Tabs>
            <Button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                `Summarize as ${summaryOptions.find((o) => o.id === activeTab)?.name}`
              )}
            </Button>
          </CardFooter>
        </Card>

        {(summary || loading) && (
          <Card
            className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-green-100 dark:border-green-900"
            ref={resultRef}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Summary</CardTitle>
                <CardDescription>{summaryOptions.find((o) => o.id === activeTab)?.name} format</CardDescription>
              </div>
              {summary && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Generating your summary...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {activeTab === "bullet" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: summary.replace(/•/g, "•&nbsp;").replace(/\n/g, "<br />") }}
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, "<br />") }} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

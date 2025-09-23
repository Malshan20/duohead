"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Star,
  Crown,
  Trophy,
  Filter,
  Search,
  ExternalLink,
  Brain,
  FileText,
  CreditCard,
  PenTool,
  Zap,
  BookOpen,
  Calculator,
  Layers,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"

const studyTools = [
  {
    id: 1,
    name: "Duoheads",
    category: "All-in-One",
    description:
      "AI-powered all-in-one study platform with flashcards, quiz generator, exam creator, and study planner.",
    features: ["AI", "Flashcards", "Exam Generator", "Study Planner", "Quiz Creator"],
    rating: 5.0,
    pricing: "Free",
    premiumAvailable: true,
    isTopPick: true,
    isFeatured: true,
    isAI: true,
    url: "https://duoheads.com",
    icon: Brain,
    color: "green",
    testimonial: "The ultimate study companion that adapts to your learning style and helps you master any subject.",
  },
  {
    id: 2,
    name: "ChatGPT",
    category: "AI Assistant",
    description:
      "Powerful AI assistant that can help with writing, answering questions, explaining concepts, and generating creative content.",
    features: ["AI", "Writing", "Research", "Homework Help"],
    rating: 4.8,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: true,
    isAI: true,
    url: "https://chat.openai.com",
    icon: Brain,
    color: "blue",
  },
  {
    id: 3,
    name: "Notion",
    category: "Note Taking",
    description:
      "All-in-one workspace for notes, tasks, wikis, and databases. Perfect for organizing your study materials and projects.",
    features: ["Organization", "Notes", "Project Management"],
    rating: 4.7,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: true,
    isAI: false,
    url: "https://notion.so",
    icon: FileText,
    color: "gray",
  },
  {
    id: 4,
    name: "Grammarly",
    category: "Writing",
    description:
      "AI writing assistant that helps you write mistake-free, clear, and engaging text across documents, emails, and more.",
    features: ["AI", "Grammar", "Proofreading", "Writing"],
    rating: 4.7,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: true,
    isAI: true,
    url: "https://grammarly.com",
    icon: PenTool,
    color: "green",
  },
  {
    id: 5,
    name: "Perplexity AI",
    category: "Research",
    description:
      "AI-powered search engine that provides comprehensive answers with cited sources, perfect for research.",
    features: ["AI", "Search", "Research", "Citations"],
    rating: 4.6,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: true,
    isAI: true,
    url: "https://perplexity.ai",
    icon: Search,
    color: "purple",
  },
  {
    id: 6,
    name: "Anki",
    category: "Flashcards",
    description:
      "Powerful, intelligent flashcard program that makes remembering things easy through spaced repetition.",
    features: ["Memorization", "Spaced Repetition", "Study"],
    rating: 4.6,
    pricing: "Free",
    premiumAvailable: false,
    isFeatured: false,
    isAI: false,
    url: "https://apps.ankiweb.net",
    icon: CreditCard,
    color: "blue",
  },
  {
    id: 7,
    name: "QuillBot",
    category: "Writing",
    description: "AI-powered paraphrasing tool that helps you rewrite and enhance any sentence, paragraph, or article.",
    features: ["AI", "Paraphrasing", "Grammar"],
    rating: 4.5,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: false,
    isAI: true,
    url: "https://quillbot.com",
    icon: PenTool,
    color: "green",
  },
  {
    id: 8,
    name: "Forest",
    category: "Productivity",
    description:
      "Stay focused and present by planting virtual trees that grow while you work and die if you leave the app.",
    features: ["Focus", "Time Management", "Pomodoro"],
    rating: 4.7,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: false,
    isAI: false,
    url: "https://forestapp.cc",
    icon: Zap,
    color: "green",
  },
  {
    id: 9,
    name: "Zotero",
    category: "Research",
    description: "Free, easy-to-use tool to help you collect, organize, cite, and share research sources and papers.",
    features: ["Citations", "Research", "Bibliography"],
    rating: 4.6,
    pricing: "Free",
    premiumAvailable: false,
    isFeatured: false,
    isAI: false,
    url: "https://zotero.org",
    icon: BookOpen,
    color: "red",
  },
  {
    id: 10,
    name: "Wolfram Alpha",
    category: "Math & Science",
    description:
      "Computational intelligence that can solve complex math problems, provide step-by-step solutions, and answer factual queries.",
    features: ["Calculations", "Math", "Science"],
    rating: 4.8,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: false,
    isAI: false,
    url: "https://wolframalpha.com",
    icon: Calculator,
    color: "orange",
  },
  {
    id: 11,
    name: "Obsidian",
    category: "Note Taking",
    description:
      "A powerful knowledge base that works on top of a local folder of plain text Markdown files for connected thinking.",
    features: ["Notes", "Knowledge Management", "Markdown"],
    rating: 4.8,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: false,
    isAI: false,
    url: "https://obsidian.md",
    icon: Layers,
    color: "purple",
  },
  {
    id: 12,
    name: "Todoist",
    category: "Productivity",
    description:
      "The to-do list to organize work & life. Regain clarity and calmness by getting tasks out of your head and onto your to-do list.",
    features: ["Tasks", "Organization", "Planning"],
    rating: 4.7,
    pricing: "Free",
    premiumAvailable: true,
    isFeatured: false,
    isAI: false,
    url: "https://todoist.com",
    icon: CheckCircle,
    color: "red",
  },
]

const categories = [
  "All Categories",
  "AI Assistant",
  "Note Taking",
  "Flashcards",
  "Writing",
  "Productivity",
  "Research",
  "Math & Science",
  "All-in-One",
]

const filters = ["All Tools", "AI Tools", "Non-AI Tools"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedFilter, setSelectedFilter] = useState("All Tools")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTools = studyTools.filter((tool) => {
    const matchesCategory = selectedCategory === "All Categories" || tool.category === selectedCategory
    const matchesFilter =
      selectedFilter === "All Tools" ||
      (selectedFilter === "AI Tools" && tool.isAI) ||
      (selectedFilter === "Non-AI Tools" && !tool.isAI)
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((feature) => feature.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesFilter && matchesSearch
  })

  const topPick = studyTools.find((tool) => tool.isTopPick)
  const featuredTools = studyTools.filter((tool) => tool.isFeatured && !tool.isTopPick)
  const allTools = studyTools.filter((tool) => !tool.isFeatured)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{rating}</span>
      </div>
    )
  }

  const renderToolCard = (tool: any, isTopPick = false) => (
    <Card
      key={tool.id}
      className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isTopPick
          ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
          : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br from-${tool.color}-500 to-${tool.color}-600 rounded-lg flex items-center justify-center`}
            >
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-xl text-gray-900 dark:text-white">{tool.name}</CardTitle>
                {isTopPick && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                {tool.category}
              </Badge>
            </div>
          </div>
          {renderStars(tool.rating)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{tool.description}</p>

        {isTopPick && tool.testimonial && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-4 border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">{tool.testimonial}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {tool.features.map((feature: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-green-600 dark:text-green-400">{tool.pricing}</span>
            {tool.premiumAvailable && (
              <Badge variant="outline" className="text-xs">
                Premium Available
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {tool.url === "https://duoheads.com" ? (
              <>
                <Link href="https://duoheads.com/auth/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    Try It Free
                  </Button>
                </Link>
                <Link href="https://duoheads.com/about">
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                  <span>Visit Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      {/* Math Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl font-light text-green-600 dark:text-green-400 rotate-12">
          ∑
        </div>
        <div className="absolute top-32 right-20 text-4xl font-light text-green-500 dark:text-green-300 -rotate-12">
          π
        </div>
        <div className="absolute top-64 left-1/4 text-5xl font-light text-green-600 dark:text-green-400 rotate-45">
          ∫
        </div>
        <div className="absolute top-96 right-1/3 text-3xl font-light text-green-500 dark:text-green-300 -rotate-6">
          √
        </div>
        <div className="absolute bottom-96 left-16 text-4xl font-light text-green-600 dark:text-green-400 rotate-12">
          α
        </div>
        <div className="absolute bottom-64 right-16 text-5xl font-light text-green-500 dark:text-green-300 -rotate-12">
          ∆
        </div>
        <div className="absolute bottom-32 left-1/3 text-3xl font-light text-green-600 dark:text-green-400 rotate-6">
          ∞
        </div>
        <div className="absolute top-1/2 left-8 text-4xl font-light text-green-500 dark:text-green-300 -rotate-45">
          θ
        </div>
        <div className="absolute top-1/3 right-8 text-3xl font-light text-green-600 dark:text-green-400 rotate-30">
          λ
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl font-light text-green-500 dark:text-green-300 -rotate-30">
          Ω
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"></div>
        <div
          className="absolute top-1/2 left-20 w-12 h-12 border-2 border-green-400 dark:border-green-500 rotate-45 opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-20 w-20 h-20 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-14 h-14 border-2 border-green-400 dark:border-green-500 rotate-12 opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
      <ForestLayout>
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Best Free Study Tools for{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                Students
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The complete guide to free study tools, AI helpers, and productivity apps that every student needs in
              2025. Curated and tested by students, for students.
            </p>

            {/* Trust Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">110+ Students Trust Us</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-12">
              Every tool on this list has been tested by real students. We show you exactly what works and what doesn't.
            </p>
          </div>
        </div>
      </section>

      {/* Top Pick Section */}
      {topPick && (
        <section className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Top Pick</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                After testing dozens of study tools, here's what we recommend as the best all-in-one solution for
                students.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">{renderToolCard(topPick, true)}</div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Filter:</span>
              </div>

              {/* Tool Type Filter */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className={selectedFilter === filter ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {filter} (
                    {filter === "All Tools"
                      ? studyTools.length
                      : filter === "AI Tools"
                        ? studyTools.filter((t) => t.isAI).length
                        : studyTools.filter((t) => !t.isAI).length}
                    )
                  </Button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-8">Showing {filteredTools.length} tools</p>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Featured Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.map((tool) => renderToolCard(tool))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">All Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => renderToolCard(tool))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Study Experience?</h2>
            <h3 className="text-2xl font-semibold mb-4">Get Started with Duoheads Today</h3>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of students who are already using Duoheads to study smarter, not harder. Get access to
              AI-powered study tools, flashcards, and more - completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://duoheads.com">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Try Duoheads Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://duoheads.com/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      </ForestLayout>
    </div>
  )
}

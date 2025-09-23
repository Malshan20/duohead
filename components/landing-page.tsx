"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Upload,
  Mic,
  CreditCard,
  HelpCircle,
  FileText,
  Heart,
  BookOpen,
  Search,
  Calendar,
  Star,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { ForestLayout } from "./layout/forest-layout"

const features = [
  {
    icon: Upload,
    title: "Upload Study Materials",
    description: "Easily upload PDFs, documents, and notes for AI analysis",
  },
  { icon: Mic, title: "Voice Tutor", description: "Interactive voice-powered tutoring sessions" },
  { icon: CreditCard, title: "Flashcards", description: "AI-generated flashcards from your materials" },
  { icon: HelpCircle, title: "Quiz", description: "Personalized quizzes to test your knowledge" },
  { icon: FileText, title: "Summarizer", description: "Instant summaries of complex topics" },
  { icon: Heart, title: "Stress Relief", description: "Mindfulness and stress management tools" },
  { icon: BookOpen, title: "Exam Generator with PYQ", description: "Practice with previous year questions" },
  { icon: Search, title: "AI Search", description: "Intelligent search across all your materials" },
  { icon: Calendar, title: "Study Planner", description: "AI-powered study schedule optimization" },
]

const testimonials = [
  {
    name: "study_diary58",
    img: "/study.jpeg",
    role: "High School Student",
    content: "Super helpful and super smooth UX. You’ve built something incredible.",
    rating: 5,
  },
  {
    name: "quietvlogs_j",
    img: "/quietvlogs_j.jpeg",
    role: "Masters Student",
    content: "got 9 grade 9s with Second Brain 🧠✨ it's been a gamechanger🙌🏻",
    rating: 5,
  },
  {
    name: "Tran_Lam",
    img: "/tran.png",
    role: "College Student",
    content: "It helps me plan my assignments and organizing my documents. Overall, good and still being completed to best.",
    rating: 5,
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

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
        <section className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700 animate-pulse">
              🎓 AI-Powered Learning Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Study smarter, not harder with your
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {" "}
                AI tutor
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              📚 Transform boring textbooks into interactive flashcards, get instant summaries, and ace your exams with
              personalized AI assistance!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Start Learning Free
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>✨ No credit card required</span>
                <span>•</span>
                <span>🎯 Free forever plan</span>
              </div>
            </div>

            {/* Student-friendly stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center space-x-1">
                <span>📈</span>
                <span>Average 40% grade improvement</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⏰</span>
                <span>Save 5+ hours per week</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🎯</span>
                <span>98% exam success rate</span>
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-2xl blur-sm opacity-75"></div>
              <img
                src="/hero.png?height=600&width=800"
                alt="Duoheads Dashboard Preview"
                className="w-full h-auto rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Infinite Scroll Universities */}
        <section className="py-12 bg-white/30 dark:bg-gray-800/30 relative z-10 overflow-hidden">
          <div className="container mx-auto px-4 text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Trusted by students from top institutions worldwide
            </p>
          </div>

          <div className="relative">
            <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex items-center justify-center min-w-0 shrink-0">
                {/* Lancaster University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/lancaster.png" alt="Lancaster University" className="h-auto w-24" />
                </div>

                {/* Harvard University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/harvard.png" alt="Harvard University" className="h-auto w-24" />
                </div>

                {/* Birmingham City University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/birmingham.png" alt="Birmingham City University" className="h-auto w-24" />
                </div>

                {/* MIT */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/mit.png" alt="MIT" className="h-auto w-24" />
                </div>

                {/* rockingham county school */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/school.png" alt="Rockingham County School" className="h-auto w-24" />
                </div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center justify-center min-w-0 shrink-0">
                {/* Lancaster University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/lancaster.png" alt="Lancaster University" className="h-auto w-24" />
                </div>

                {/* Harvard University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/harvard.png" alt="Harvard University" className="h-auto w-24" />
                </div>

                {/* Birmingham City University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/birmingham.png" alt="Birmingham City University" className="h-auto w-24" />
                </div>

                {/* MIT */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/mit.png" alt="MIT" className="h-auto w-24" />
                </div>

                {/* rockingham county school */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/school.png" alt="Rockingham County School" className="h-auto w-24" />
                </div>
              </div>

              {/* Third set of logos */}
              <div className="flex items-center justify-center min-w-0 shrink-0">
                {/* Lancaster University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/lancaster.png" alt="Lancaster University" className="h-auto w-24" />
                </div>

                {/* Harvard University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/harvard.png" alt="Harvard University" className="h-auto w-24" />
                </div>

                {/* Birmingham City University */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/birmingham.png" alt="Birmingham City University" className="h-auto w-24" />
                </div>

                {/* MIT */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/mit.png" alt="MIT" className="h-auto w-24" />
                </div>

                {/* rockingham county school */}
                <div className="mx-8 flex items-center justify-center h-16 w-32 grayscale hover:grayscale-0 transition-all duration-300">
                  <img src="/school.png" alt="Rockingham County School" className="h-auto w-24" />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Social Proof */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-gray-600 dark:text-gray-300">Built by students for students</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <span className="text-gray-600 dark:text-gray-300">100+ happy students worldwide</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-gray-600 dark:text-gray-300">Learn 3x faster with AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                🧠 Your study buddy that never sleeps
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From cramming for finals to daily homework - we've got your back with these game-changing features! 🎯
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-100 dark:border-green-800"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>



        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-20 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-green-900"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                🌱 Choose your growth plan
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From seedling to jungle master - find the perfect plan for your learning journey! 🚀
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Seedling Plan */}
              <Card className="relative bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200 dark:border-green-700">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🌱</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seedling</h3>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      $0<span className="text-lg text-gray-500">/forever</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Perfect for sprouting minds</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      10 document uploads per month
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      2000 character AI summaries
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      20 flashcards month
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Simple study planner
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      10 exam generations
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Voice AI Tutor (2 mins/day) 🚀
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Community support
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Stress relief full access
                    </li>
                  </ul>

                  <Link href="/auth/signup">
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white">🌱 Start Free Forever</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Forest Guardian Plan - Popular */}
              <Card className="relative bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-500 dark:border-green-400 scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-semibold">🔥 Most Popular</Badge>
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🌳</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forest Guardian</h3>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      $9.99<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Everything you need to thrive</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      50 document uploads per month
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced neural summaries
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Unlimited bio-flashcards
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      AI ecosystem planner with reminders
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Quantum quiz generation
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      30 exam generations
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Voice AI Tutor (30 mins/day) 🚀
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Priority forest support
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Stress relief full access
                    </li>
                  </ul>

                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                      🌳 Upgrade to Guardian
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Jungle Master Plan */}
              <Card className="relative bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-300 dark:border-green-600">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🌿</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Jungle Master</h3>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      $34.99<span className="text-lg text-gray-500">/semester</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">One-time access to the learning jungle</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      All Forest Guardian features
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Unlimited document uploads per month
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      4-month jungle access
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Perfect for semester exploration
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced exam preparation tools
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Voice AI Tutor (60 mins/day) 🚀
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Study tribe management
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mr-2">✓</span>
                      Stress relief full access
                    </li>
                  </ul>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">🌿 Master the Jungle</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Footer */}
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                💡 All plans include our happiness guarantee - cancel anytime, no questions asked!
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>✨ No hidden fees</span>
                <span>🔒 Secure payments</span>
                <span>📱 Works on all devices</span>
                <span>🎓 Student discounts available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-20 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-green-900"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Students are absolutely loving it! <Heart className="inline w-8 h-8 text-red-500" />
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Real stories from real students who aced their exams 📚✨
              </p>
            </div>

            {/* Social Media Comments Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      {/* Show avatar if available, otherwise fallback to placeholder */}
                      <img
                        src={testimonial.img ? testimonial.img : "/placeholder.svg"}
                        alt={`${testimonial.name} avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {/* No verified badge in original data, but you could add if needed */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 text-sm">{testimonial.name}</span>
                        {/* No timeAgo in original data, so omit */}
                      </div>
                      <p className="text-gray-800 text-sm mt-1 leading-relaxed">"{testimonial.content}"</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-1 text-gray-500">
                          {/* Show stars as likes for visual parity */}
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          {/* Optionally, show rating number */}
                          {/* <span className="text-xs font-medium">{testimonial.rating}</span> */}
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Heart className="w-4 h-4" />
                          {/* No likes in original data, so just show icon */}
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {/* MessageCircle icon for reply */}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          <span className="text-xs">Reply</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                🤔 Got questions? We've got <span className="text-green-500">answers!</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to know before joining the Duoheads family 🎓
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    question: "Do I get charged until I manually pay for a plan, and is the free plan forever?",
                    answer:
                      "The free plan is completely free forever, with no credit card required to sign up or use it. There are no hidden fees, and you won't be charged unless you manually choose to upgrade to a paid plan like Forest Guardian.",
                  },
                  {
                    question: "How does the AI summarization work?",
                    answer:
                      "Our AI uses advanced language models to analyze your documents and extract key concepts, definitions, and important information. It creates concise, student-friendly summaries that highlight the most important points for studying.",
                  },
                  {
                    question: "What file types can I upload?",
                    answer:
                      "You can upload PDFs, images (PNG, JPG, JPEG), audio files (MP3, WAV), and text files. Our AI can process and extract content from all these formats to create summaries and study materials.",
                  },
                  {
                    question: "How many documents can I upload on the free plan?",
                    answer:
                      "The free plan allows you to upload up to 10 documents per month. You also get basic AI summaries and up to 10 flashcards per document. Upgrade to Pro for unlimited uploads and advanced features.",
                  },
                  {
                    question: "How accurate are the AI-generated flashcards?",
                    answer:
                      "Our AI is trained specifically for educational content and creates highly accurate flashcards. However, we recommend reviewing them and making adjustments as needed for your specific learning style.",
                  },
                  {
                    question: "What happens to my data if I cancel my subscription?",
                    answer:
                      "Your data remains accessible for 30 days after cancellation. You can export your materials during this time. After 30 days, your account will be permanently deleted.",
                  },
                ].map((faq, index) => (
                  <Card
                    key={index}
                    className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardContent className="p-6">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform duration-200" />
                        </summary>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                🚀 Ready to become a study superhero?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of students who went from stressed to success with Duoheads! 🎯✨
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    🎓 Start Your Success Story
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <div className="text-sm text-gray-600 dark:text-gray-400">💯 Free forever • No spam • Cancel anytime</div>
              </div>
            </div>
          </div>
        </section>

      </ForestLayout>
    </div>
  )
}

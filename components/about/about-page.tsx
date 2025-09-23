"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Heart, Zap, GraduationCap } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"

const values = [
  {
    icon: Target,
    title: "Student-Centric",
    description: "Prioritizing student success by creating tools that enhance learning efficiency and reduce academic stress.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Harnessing advanced AI to deliver transformative educational experiences that redefine how students learn.",
  },
  {
    icon: Heart,
    title: "Accessibility",
    description: "Ensuring high-quality education tools are available to all students, regardless of their circumstances.",
  },
  {
    icon: GraduationCap,
    title: "Empowerment",
    description: "Equipping students with the skills and confidence to become self-reliant learners and excel academically.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl font-light text-gray-600 dark:text-gray-400 rotate-12">
          ∑
        </div>
        <div className="absolute top-32 right-20 text-4xl font-light text-gray-500 dark:text-gray-300 -rotate-12">
          π
        </div>
        <div className="absolute top-64 left-1/4 text-5xl font-light text-gray-600 dark:text-gray-400 rotate-45">
          ∫
        </div>
        <div className="absolute top-96 right-1/3 text-3xl font-light text-gray-500 dark:text-gray-300 -rotate-6">
          √
        </div>
        <div className="absolute bottom-96 left-16 text-4xl font-light text-gray-600 dark:text-gray-400 rotate-12">
          α
        </div>
        <div className="absolute bottom-64 right-16 text-5xl font-light text-gray-500 dark:text-gray-300 -rotate-12">
          ∆
        </div>
        <div className="absolute bottom-32 left-1/3 text-3xl font-light text-gray-600 dark:text-gray-400 rotate-6">
          ∞
        </div>
        <div className="absolute top-1/2 left-8 text-4xl font-light text-gray-500 dark:text-gray-300 -rotate-45">
          θ
        </div>
        <div className="absolute top-1/3 right-8 text-3xl font-light text-gray-600 dark:text-gray-400 rotate-30">
          λ
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl font-light text-gray-500 dark:text-gray-300 -rotate-30">
          Ω
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-full opacity-20 animate-float"></div>
        <div
          className="absolute top-1/2 left-20 w-12 h-12 border-2 border-gray-400 dark:border-gray-500 rotate-45 opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-20 w-20 h-20 border-2 border-gray-300 dark:border-gray-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-14 h-14 border-2 border-gray-400 dark:border-gray-500 rotate-12 opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
      <ForestLayout>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700">
              🚀 Established March 2025
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
                Duoheads
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Duoheads is a pioneering educational technology company dedicated to transforming the learning experience through innovative AI-powered tools, making education more effective, engaging, and accessible for students worldwide.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                <p className="text-lg leading-relaxed mb-6">
                  Founded in March 2025, Duoheads emerged from a vision to address the challenges students face in traditional learning environments. Our mission was clear: to leverage artificial intelligence to streamline study processes and empower students to focus on mastering knowledge.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  What began as a solution to simplify academic tasks like creating study materials and organizing content has grown into a platform that serves thousands of students globally. Our AI-driven tools are designed to enhance comprehension, boost retention, and reduce the stress associated with academic workloads.
                </p>
                <p className="text-lg leading-relaxed">
                  At Duoheads, we are committed to evolving education by providing cutting-edge solutions that prioritize student success and accessibility, ensuring every learner has the tools to thrive in their academic journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-16 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Mission</h2>
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-8 text-white">
                <p className="text-2xl font-medium leading-relaxed">
                  "To empower students worldwide with AI-driven educational tools that enhance learning efficiency, reduce academic stress, and unlock their full potential, regardless of their circumstances."
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">100+</div>
                  <p className="text-gray-600 dark:text-gray-300">Students Supported</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">40%</div>
                  <p className="text-gray-600 dark:text-gray-300">Average Academic Improvement</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">98%</div>
                  <p className="text-gray-600 dark:text-gray-300">User Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Join the Future of Learning</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Partner with Duoheads to transform education and empower students worldwide with innovative AI tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                >
                  Explore Our Solutions
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 bg-transparent"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ForestLayout>
    </div>
  )
}
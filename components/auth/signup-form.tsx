"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Mail, Lock, User, GraduationCap, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    school: "",
    major: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            school: formData.school,
            major: formData.major,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: formData.fullName,
          school: formData.school,
          major: formData.major,
          subscription_tier: "Seedling",
          subscription_status: "active",
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        toast({
          title: "Welcome!",
          description: "Your account has been created.",
        })

        router.push(`/auth/thank-you?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Google Sign Up Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="backdrop-blur-md bg-slate-900/80 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Animated Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <Image src="/logo.png" alt="App Logo" width={50} height={50} />
            </div>
          </div>

          {/* Title with Gradient */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Start your learning journey today
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-200 font-medium">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  className="pl-12 h-12 bg-slate-800/50 border-slate-600 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-slate-400"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="pl-12 h-12 bg-slate-800/50 border-slate-600 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-slate-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="pl-12 pr-12 h-12 bg-slate-800/50 border-slate-600 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-slate-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* School Field */}
            <div className="space-y-2">
              <Label htmlFor="school" className="text-slate-200 font-medium">
                School/University
              </Label>
              <div className="relative group">
                <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="school"
                  type="text"
                  placeholder="Your learning institution"
                  className="pl-12 h-12 bg-slate-800/50 border-slate-600 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-slate-400"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
            </div>

            {/* Major Field */}
            <div className="space-y-2">
              <Label htmlFor="major" className="text-slate-200 font-medium">
                Major/Field of Study
              </Label>
              <div className="relative group">
                <Brain className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="major"
                  type="text"
                  placeholder="Your area of expertise"
                  className="pl-12 h-12 bg-slate-800/50 border-slate-600 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-slate-400"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign Up</span>
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white font-medium transition-all duration-300 transform hover:scale-[1.02]"
              onClick={handleGoogleSignUp}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          {/* Footer Links */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <span className="text-slate-400 text-sm">Already have an account? </span>
              <Link
                href="/auth/signin"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

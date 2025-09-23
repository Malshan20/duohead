"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "@/components/layout/forest-layout"
import { useRouter } from "next/navigation"

export function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user has a valid session for password reset
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        // Redirect to forgot password if no valid session
        router.push("/auth/forgot-password")
      }
    }
    checkSession()
  }, [supabase.auth, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <ForestLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Verifying session...</p>
          </div>
        </div>
      </ForestLayout>
    )
  }

  if (success) {
    return (
      <ForestLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md backdrop-blur-md bg-white/10 border-emerald-200/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Password Updated! 🎉</CardTitle>
              <CardDescription className="text-slate-600">
                Your password has been successfully updated. You'll be redirected to your dashboard shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </ForestLayout>
    )
  }

  return (
    <ForestLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-md bg-white/10 border-emerald-200/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Reset Your Password</CardTitle>
              <CardDescription className="text-slate-600">
                Enter your new password below to complete the reset process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 border-emerald-200/50 focus:border-emerald-400"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/50 border-emerald-200/50 focus:border-emerald-400"
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50/50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/signin" className="text-sm text-emerald-600 hover:text-emerald-700">
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ForestLayout>
  )
}

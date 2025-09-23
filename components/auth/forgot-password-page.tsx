"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Password reset email sent! Check your inbox.")
        setEmailSent(true)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ForestLayout>
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 ">
        {/* Back to Sign In */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        <Card className="backdrop-blur-md bg-white/50 border-emerald-200/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {emailSent ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {emailSent
                ? "We've sent a password reset link to your email address."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50 border-emerald-200/50 focus:border-emerald-400"
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50/50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="border-emerald-200 bg-emerald-50/50">
                    <AlertDescription className="text-emerald-700">{message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <Button
                    onClick={() => {
                      setEmailSent(false)
                      setMessage("")
                      setError("")
                    }}
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Remember your password?{" "}
                <Link href="/auth/signin" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
            </CardContent>
          </Card>
          </div>
        </div>
    </ForestLayout>
  )
}

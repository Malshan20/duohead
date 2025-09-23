"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "@/components/layout/forest-layout"
import { useSearchParams } from "next/navigation"

export function ThankYouPageContent() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [resendError, setResendError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)

  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const supabase = createClient()

  useEffect(() => {
    if (email) {
      setUserEmail(email)
    } else {
      // Try to get user email from session
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      }
      getUser()
    }
  }, [email, supabase.auth])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const handleResendEmail = async () => {
    if (!userEmail) {
      setResendError("Email address not found. Please sign up again.")
      return
    }

    setIsResending(true)
    setResendError("")
    setResendMessage("")

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      })

      if (error) {
        setResendError(error.message)
      } else {
        setResendMessage("Verification email sent successfully!")
        setCanResend(false)
        setCountdown(60) // 60 second cooldown
      }
    } catch (err) {
      setResendError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <ForestLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="backdrop-blur-md bg-white/50 border-emerald-200/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Welcome!</CardTitle>
              <CardDescription className="text-slate-600">
                Thank you for signing up. We've sent a verification email to help you get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Display */}
              {userEmail && (
                <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-200/50">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Verification sent to:</span>
                  </div>
                  <p className="text-emerald-800 font-medium mt-1">{userEmail}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Check your email inbox for our verification message</li>
                  <li>Click the verification link to activate your account</li>
                  <li>Start using your account!</li>
                </ol>
              </div>

              {/* Resend Email Section */}
              <div className="border-t border-emerald-200/30 pt-4">
                <p className="text-sm text-slate-600 mb-3">
                  Didn't receive the email? Check your spam folder or resend it.
                </p>

                {resendMessage && (
                  <Alert className="border-emerald-200 bg-emerald-50/50 mb-3">
                    <AlertDescription className="text-emerald-700">{resendMessage}</AlertDescription>
                  </Alert>
                )}

                {resendError && (
                  <Alert className="border-red-200 bg-red-50/50 mb-3">
                    <AlertDescription className="text-red-700">{resendError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !canResend}
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : !canResend ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-2 pt-4 border-t border-emerald-200/30">
                <p className="text-sm text-slate-600">Already verified your email?</p>
                <Link
                  href="/auth/signin"
                  className="inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  Sign in to your account →
                </Link>
              </div>

              {/* Help Section */}
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                <p className="text-xs text-slate-500 text-center">
                  Need help? Contact our{" "}
                  <Link href="/contact" className="text-emerald-600 hover:text-emerald-700">
                    support team
                  </Link>{" "}
                  for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ForestLayout>
  )
}

// Keep the old export for backward compatibility
export function ThankYouPage() {
  return <ThankYouPageContent />
}

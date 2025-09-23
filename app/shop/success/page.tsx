"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Here you could verify the payment with Stripe and update the order status
      // For now, we'll just show the success message
      setIsLoading(false)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-100 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl text-gray-900 dark:text-white">Payment Successful!</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Thank you for your purchase. Your Digital Study Planner & Journal is ready for download.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">What happens next?</h3>
                <ul className="text-green-700 dark:text-green-300 space-y-2">
                  <li>• Your payment has been processed successfully</li>
                  <li>• You will receive an email confirmation shortly</li>
                  <li>• Download links will be sent to your email within 24 hours</li>
                  <li>• Check your spam folder if you don't see the email</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Link href="/shop">
                    <Download className="w-4 h-4 mr-2" />
                    Check Order Status
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-green-200 dark:border-green-800 bg-transparent"
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              {sessionId && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>Session ID: {sessionId.slice(0, 20)}...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

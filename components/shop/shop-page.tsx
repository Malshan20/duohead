"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, Check, BookOpen, Target, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { OrderStatusDialog } from "@/components/order-status-dialog"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ShopPage() {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "" })
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      // Store customer information via server-side API
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        product_name: "Digital Study Planner and Journal",
        amount: 2.0,
        currency: "USD",
        status: "pending",
        created_at: new Date().toISOString(),
      }

      console.log("Creating order with data:", orderData)
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("Order Response Status:", orderResponse.status, orderResponse.statusText)
      let orderDataResponse
      try {
        orderDataResponse = await orderResponse.json()
      } catch (jsonError) {
        console.error("Order Response JSON Parse Error:", jsonError)
        alert("Failed to process order response. Please try again.")
        setIsLoading(false)
        return
      }

      const { orderId, error: orderError } = orderDataResponse

      if (orderError || !orderId) {
        console.error("Order Creation Error:", orderError)
        alert(`Failed to process your order. Details: ${orderError || "No order ID returned"}`)
        setIsLoading(false)
        return
      }

      console.log("Order created with ID:", orderId)

      // Create Stripe Checkout session
      console.log("Fetching Stripe Checkout session...")
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerInfo.email,
          name: customerInfo.name,
          orderId: orderId.toString(),
        }),
      })

      console.log("Stripe Response Status:", response.status, response.statusText)
      let responseData
      try {
        responseData = await response.json()
      } catch (jsonError) {
        console.error("Stripe Response JSON Parse Error:", jsonError)
        alert("Failed to process payment response. Please try again.")
        setIsLoading(false)
        return
      }

      console.log("Stripe Response Data:", responseData)
      const { sessionId, error: checkoutError } = responseData

      if (checkoutError) {
        console.error("Checkout Error:", checkoutError)
        alert(`Failed to create payment session: ${checkoutError}`)
        setIsLoading(false)
        return
      }

      if (!sessionId) {
        console.error("No sessionId returned from Stripe API")
        alert("Failed to create payment session. Please try again.")
        setIsLoading(false)
        return
      }

      if (typeof window === "undefined") {
        console.error("Stripe.js can only be used in a browser environment")
        alert("Payment system unavailable. Please try again.")
        setIsLoading(false)
        return
      }

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
        alert("Payment system configuration error. Please contact support.")
        setIsLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      console.log("Loading Stripe module...")
      let stripeModule
      try {
        stripeModule = await import("@stripe/stripe-js")
      } catch (importError) {
        console.error("Failed to load Stripe module:", importError)
        alert("Failed to load payment system. Please try again.")
        setIsLoading(false)
        return
      }

      console.log("Stripe Module Loaded:", stripeModule)
      const stripe = await stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (!stripe) {
        console.error("Failed to initialize Stripe client: Invalid publishable key")
        alert("Payment system initialization failed. Please contact support.")
        setIsLoading(false)
        return
      }

      console.log("Stripe Client Initialized:", stripe)
      console.log("Redirecting to Stripe Checkout with sessionId:", sessionId)

      // Verify redirectToCheckout exists
      if (typeof stripe.redirectToCheckout !== "function") {
        console.error("stripe.redirectToCheckout is not a function")
        alert("Payment system error: redirectToCheckout unavailable. Please contact support.")
        setIsLoading(false)
        return
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
      if (stripeError) {
        console.error("Stripe Redirect Error:", stripeError)
        alert(`Payment error: ${stripeError.message}`)
        await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error in payment process:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      alert(`There was an error processing your request: ${error.message}. Please try again.`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="border-b border-green-100 dark:border-green-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-green-600 dark:text-green-400 text-sm mb-4 block items-center gap-1">
            <Image src="/logo.png" alt="Duoheads" width={32} height={32} />
          </Link>
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Duoheads Shop</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsStatusDialogOpen(true)}
              variant="outline"
              className="border-green-200 dark:border-green-800"
            >
              Order Status
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-green-700 dark:text-green-300 text-base font-medium shadow-sm border border-green-200 dark:border-green-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Master Your Studies with Our
            <span className="text-green-600 dark:text-green-400"> Digital Planner</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The ultimate study companion that combines planning and journaling in one beautiful, organized system.
          </p>
        </div>

        {/* Product Images */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/1.jpg?height=400&width=300&text=Study+Journal+Pages"
              alt="Study Journal Pages"
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/2.jpg?height=400&width=300&text=Study+Journal+Pages"
              alt="Study Journal Pages"
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/3.jpg?height=400&width=300&text=Goal+Setting+Pages"
              alt="Goal Setting Pages"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Product Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900 dark:text-white">Digital Study Planner & Journal</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to organize your academic life in one comprehensive digital package
              </CardDescription>
              <div className="flex justify-center items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300">(4.9/5 from 100+ students)</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold text-green-600 dark:text-green-400">$2.00</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 line-through">$5.99</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Study Planner Features
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Weekly & Monthly Planning Templates",
                      "Assignment Tracking System",
                      "Study Schedule Builder",
                      "Progress Monitoring Tools",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Journal Features
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Daily Reflection Prompts",
                      "Goal Setting Worksheets",
                      "Habit Tracking Pages",
                      "Academic Achievement Log",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">What's Included:</h4>
                <ul className="text-green-700 dark:text-green-300 space-y-1">
                  <li>• 150+ Pages of Planning Templates</li>
                  <li>• Digital PDF Format (Print or Use Digitally)</li>
                  <li>• Mobile & Tablet Friendly</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => setIsPurchaseDialogOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-6 text-lg font-semibold"
              >
                Get Your Study Planner Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Purchase & Order Guidelines */}
      <div className="max-w-2xl mx-auto mt-10 mb-8 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-green-100 dark:border-green-900">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Purchase & Order Guidelines</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
          <li>After you have made the payment, your payment will be processed within 24 hours.</li>
          <li>
            To check your order status, use your email address by clicking the{" "}
            <span className="font-medium text-green-700 dark:text-green-300">Order Status</span> button.
          </li>
          <li>If you have any issues or questions, please contact our support team.</li>
        </ul>
      </div>

      {/* Footer */}
      <footer className="border-t border-green-100 dark:border-green-900 mt-16">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
          <span>&copy; {new Date().getFullYear()} Duoheads Shop. All rights reserved.</span>
          <div className="flex gap-4">
            <Link
              href="https://www.duoheads.com/terms"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
            <Link
              href="https://www.duoheads.com/privacy"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* Purchase Info Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>Please provide your details to proceed with the payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
              />
            </div>
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Status Dialog */}
      <OrderStatusDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen} />
    </div>
  )
}

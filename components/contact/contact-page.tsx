"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Clock, Send, CheckCircle, Users, HelpCircle, Bug, Lightbulb } from "lucide-react"
import Link from "next/link"
import { insertContactMessage, type ContactMessageResponse } from "@/lib/supabase"
import { ForestLayout } from "../layout/forest-layout"

const contactReasons = [
  { icon: HelpCircle, label: "General Support", value: "support" },
  { icon: Bug, label: "Bug Report", value: "bug" },
  { icon: Lightbulb, label: "Feature Request", value: "feature" },
  { icon: Users, label: "Partnership", value: "partnership" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    reason: "support",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response: ContactMessageResponse = await insertContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: formData.subject || `${formData.reason} - Contact Form`,
        status: "unread",
        user_id: null,
      })

      setTicketNumber(response.ticket_number)
      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "", reason: "support" })
    } catch (error) {
      console.error("Error submitting contact form:", error)
      alert("There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <ForestLayout>
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
        {/* Header */}

        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700">
              💬 Get in Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Contact{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Have questions, feedback, or need help? We'd love to hear from you! Our team is here to support your
              learning journey and make Duoheads even better.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">Send us a Message</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Your Ticket Number:
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                          {ticketNumber}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Please save this number for your records
                        </p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Thank you for reaching out. We'll get back to you within 24 hours using your ticket number
                        above.
                      </p>
                      <Button
                        onClick={() => {
                          setIsSubmitted(false)
                          setTicketNumber("")
                        }}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="reason"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          What can we help you with?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {contactReasons.map((reason) => (
                            <button
                              key={reason.value}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, reason: reason.value }))}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                                formData.reason === reason.value
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                              }`}
                              disabled={isSubmitting}
                            >
                              {reason.icon && <reason.icon className="w-5 h-5" />}
                              <span className="text-xs font-medium">{reason.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Brief description of your inquiry"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more about your question or feedback..."
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-gray-600 dark:text-gray-300">support@duoheads.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
                        <p className="text-gray-600 dark:text-gray-300">Available on our website</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Response Time</p>
                        <p className="text-gray-600 dark:text-gray-300">Within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Help</h3>
                  <div className="space-y-3">
                   
                    <div className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Chat with Ellie</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Our AI assistant is always available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Need Immediate Help?</h3>
                  <p className="text-green-100 mb-4">
                    For urgent issues, try our AI chatbot Ellie first - she's available 24/7 and can help with most
                    questions instantly!
                  </p>
                  <Button variant="secondary" className="w-full">
                    Chat with Ellie Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ForestLayout>
  )
}

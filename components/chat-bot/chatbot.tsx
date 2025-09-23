"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Bot, Minimize2, Phone, Mail } from "lucide-react"
import { type ContactMessage, insertContactMessage } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ContactForm {
  name: string
  email: string
  message: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! 👋 I'm Ellie, your AI study buddy! I can help answer questions about Duoheads or connect you with our human support team. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  })
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (content: string, sender: "user" | "bot") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const getAIResponse = async (userMessage: string) => {
    try {
      const response = await fetch("/api/chat-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return (
          errorData.error ||
          "I'm having trouble connecting right now. Would you like to speak with our human support team instead? 🤔"
        )
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Chat API error:", error)
      return "I'm having trouble connecting right now. Would you like to speak with our human support team? 🤔"
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue("")
    addMessage(userMessage, "user")
    setIsLoading(true)
    setIsTyping(true)

    // Check if user wants human support
    const humanKeywords = [
      "human",
      "person",
      "support",
      "help me",
      "talk to someone",
      "customer service",
      "representative",
      "agent",
      "staff",
    ]

    const wantsHuman = humanKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword))

    if (wantsHuman) {
      setTimeout(() => {
        setIsTyping(false)
        addMessage(
          "I'd love to connect you with our human support team! They're amazing at helping with detailed questions. Just let me know your name and email, and they'll get back to you soon! 😊",
          "bot",
        )
        setShowContactForm(true)
        setIsLoading(false)
      }, 1000)
      return
    }

    try {
      const response = await getAIResponse(userMessage)
      setTimeout(() => {
        setIsTyping(false)
        addMessage(response, "bot")
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false)
        addMessage(
          "Sorry, I'm having trouble right now. Would you like to speak with our human support team? 🤔",
          "bot",
        )
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email) {
      addMessage("Please fill in your name and email so our team can reach you! 📧", "bot")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactForm.email)) {
      addMessage("Please enter a valid email address! 📧", "bot")
      return
    }

    setIsSubmittingContact(true)

    try {
      // Insert contact message into Supabase
      const contactData: Omit<ContactMessage, "id" | "created_at" | "updated_at"> = {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message || "General inquiry from chatbot",
        subject: "Chatbot Support Request",
        source: "chatbot",
        status: "unread",
        user_id: null,
        
      }

      const result = await insertContactMessage(contactData)

      addMessage(
        `Perfect! Thanks ${contactForm.name}! 🎉 Your ticket number is ${result.ticket_number}. Our human support team will reach out to ${contactForm.email} within 24 hours. They'll help you with: "${contactForm.message || "General inquiry"}"`,
        "bot",
      )

      setShowContactForm(false)
      setContactForm({ name: "", email: "", message: "" })

      // Show success message
      setTimeout(() => {
        addMessage(
          "Your request has been saved to our database! 💾 Is there anything else I can help you with in the meantime? 😊",
          "bot",
        )
      }, 1500)
    } catch (error) {
      console.error("Error submitting contact request:", error)
      addMessage(
        "Sorry, there was an issue saving your request. Please try again or email us directly at support@duoheads.com 📧",
        "bot",
      )
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`w-96 bg-white dark:bg-gray-800 shadow-2xl border-2 border-green-200 dark:border-green-700 transition-all duration-300 ${isMinimized ? "h-16" : "h-[500px]"}`}
      >
        {/* Header */}
        <CardHeader className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Ellie</h3>
                <p className="text-xs text-green-100">AI Study Assistant</p>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-green-500 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === "bot" && <Bot className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-green-500" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Connect with Human Support</span>
                  </div>
                  <Input
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                    disabled={isSubmittingContact}
                  />
                  <Input
                    placeholder="Your email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-sm"
                    disabled={isSubmittingContact}
                  />
                  <Input
                    placeholder="What can we help you with? (optional)"
                    value={contactForm.message}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                    className="text-sm"
                    disabled={isSubmittingContact}
                  />
                  <Button
                    onClick={handleContactSubmit}
                    disabled={isSubmittingContact}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
                  >
                    {isSubmittingContact ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Connect with Support
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about Duoheads..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  • Say "human support" for personal help
                </p>
                <Badge
                  variant="outline"
                  className="text-xs border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                  Ellie AI
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

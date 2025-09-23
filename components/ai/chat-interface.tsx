"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Send, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  context?: string
  placeholder?: string
}

export function ChatInterface({ context, placeholder = "Ask me anything about your studies..." }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI tutor. I'm here to help you understand concepts, answer questions, and guide your learning. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("Sending chat request...")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: userMessage.content,
            },
          ],
          context,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        console.log("Raw chunk:", chunk)

        // Split chunk by lines and process each
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.trim() === "") continue

          try {
            // Handle AI SDK data stream format
            if (line.startsWith("0:")) {
              // Text delta - this contains the actual message content
              const textContent = line.substring(2)
              // Remove quotes if it's a JSON string
              const cleanText =
                textContent.startsWith('"') && textContent.endsWith('"') ? JSON.parse(textContent) : textContent
              fullResponse += cleanText
              console.log("Added text:", cleanText)
            } else if (line.startsWith("1:")) {
              // Function call delta
              console.log("Function call:", line.substring(2))
            } else if (line.startsWith("2:")) {
              // Tool result delta
              console.log("Tool result:", line.substring(2))
            } else if (line.startsWith("8:")) {
              // Error delta
              console.error("Stream error:", line.substring(2))
            } else if (line.startsWith("9:")) {
              // Finish delta
              console.log("Stream finished:", line.substring(2))
            } else if (line.startsWith("d:")) {
              // Done event
              console.log("Stream done:", line.substring(2))
            } else if (line.startsWith("e:")) {
              // End event
              console.log("Stream end:", line.substring(2))
            } else {
              // Fallback for other formats
              console.log("Unknown format:", line)
            }
          } catch (parseError) {
            console.error("Parse error:", parseError, "for line:", line)
          }
        }

        // Update the message with accumulated response
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: fullResponse } : msg)),
        )
      }

      console.log("Chat completed successfully")
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] max-w-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-green-600" />
          AI Tutor Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                      <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-2 sm:px-3 py-2 break-words ${
                    message.role === "user"
                      ? "bg-green-600 text-white ml-auto"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 sm:p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

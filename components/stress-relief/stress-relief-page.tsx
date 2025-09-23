"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Send, Palette, Heart, Smile, Zap, Moon, Sun, Coffee, BookOpen, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { YouTubePlayer } from "./youtube-player"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const backgrounds = [
  {
    id: "default",
    name: "Default",
    image: null,
    icon: Sun,
    gradient: "from-blue-400 via-purple-500 to-pink-500",
    chatboxStyle: "bg-gradient-to-br from-blue-50/95 via-purple-50/95 to-pink-50/95 backdrop-blur-md",
  },
  {
    id: "forest",
    name: "Forest",
    image: "/images/backgrounds/forest.svg",
    icon: Zap,
    gradient: "from-green-400 to-green-600",
    chatboxStyle: "bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-md",
    chatboxImage:
      "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/forest.svg)",
  },
  {
    id: "beach",
    name: "Beach",
    image: "/images/backgrounds/beach.svg",
    icon: Sun,
    gradient: "from-blue-400 to-cyan-500",
    chatboxStyle: "bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-md",
    chatboxImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/beach.svg)",
  },
  {
    id: "mountains",
    name: "Mountains",
    image: "/images/backgrounds/mountains.svg",
    icon: Zap,
    gradient: "from-gray-400 to-gray-600",
    chatboxStyle: "bg-gradient-to-br from-gray-50/90 to-slate-50/90 backdrop-blur-md",
    chatboxImage:
      "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/mountains.svg)",
  },
  {
    id: "rainy",
    name: "Rainy Window",
    image: "/images/backgrounds/rainy-window.svg",
    icon: Moon,
    gradient: "from-gray-500 to-blue-600",
    chatboxStyle: "bg-gradient-to-br from-slate-50/90 to-blue-50/90 backdrop-blur-md",
    chatboxImage:
      "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/rainy-window.svg)",
  },
  {
    id: "cafe",
    name: "Café",
    image: "/images/backgrounds/cafe.svg",
    icon: Coffee,
    gradient: "from-amber-400 to-orange-500",
    chatboxStyle: "bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-md",
    chatboxImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/cafe.svg)",
  },
  {
    id: "library",
    name: "Library",
    image: "/images/backgrounds/library.svg",
    icon: BookOpen,
    gradient: "from-amber-600 to-yellow-600",
    chatboxStyle: "bg-gradient-to-br from-yellow-50/90 to-amber-50/90 backdrop-blur-md",
    chatboxImage:
      "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/library.svg)",
  },
  {
    id: "space",
    name: "Space",
    image: "/images/backgrounds/space.svg",
    icon: Sparkles,
    gradient: "from-purple-600 to-indigo-800",
    chatboxStyle: "bg-gradient-to-br from-purple-50/90 to-indigo-50/90 backdrop-blur-md",
    chatboxImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/images/backgrounds/space.svg)",
  },
]

const stressReliefPrompts = [
  "I'm feeling overwhelmed with studies",
  "Help me relax before an exam",
  "I need motivation to keep going",
  "Feeling anxious about deadlines",
  "Need some positive affirmations",
  "Help me focus better",
]

export function StressReliefPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm here to help you relax and manage stress. How are you feeling today? 🌸",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0])
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    setTimeout(() => scrollToBottom(), 100)

    try {
      const response = await fetch("/api/ai/stress-relief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Take a deep breath and try again in a moment. 🌿",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setTimeout(() => scrollToBottom(), 100)
    } finally {
      setIsLoading(false)
    }
  }

  const backgroundStyle = selectedBackground.image
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${selectedBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {
        background: `linear-gradient(135deg, ${selectedBackground.gradient.replace("from-", "").replace("to-", "").replace(" ", ", ")})`,
        backgroundAttachment: "fixed",
      }

  const getChatboxBackgroundStyle = () => {
    if (selectedBackground.chatboxImage) {
      return {
        backgroundImage: selectedBackground.chatboxImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    }
    return {}
  }

  return (
    <div className="min-h-screen transition-all duration-1000 ease-in-out relative" style={backgroundStyle}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Stress Relief Chat 🌸</h1>
            <p className="text-white/80 text-sm sm:text-base">Your personal space for relaxation and peace</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Palette className="w-4 h-4 mr-2" />
              Ambiance
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Chat Section */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Card
              className={`${selectedBackground.chatboxStyle} shadow-2xl h-[70vh] min-h-[500px] max-h-[800px] flex flex-col transition-all duration-1000 border-white/20`}
              style={getChatboxBackgroundStyle()}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Wellness Chat
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-4 sm:px-6">
                    <div className="space-y-3 py-4 min-h-0">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl break-words ${
                              message.isUser
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "bg-white/80 text-gray-800 backdrop-blur-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isUser ? "text-white/70" : "text-gray-500"}`}>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl">
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
                      )}
                      <div ref={messagesEndRef} className="h-0" />
                    </div>
                  </ScrollArea>
                </div>

                {/* Quick Prompts */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-gray-200/50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {stressReliefPrompts.slice(0, 3).map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(prompt)}
                        className="text-xs bg-white/50 hover:bg-white/70 border-gray-300/50 flex-shrink-0 text-black hover:text-black"
                        disabled={isLoading}
                      >
                        {prompt.length > 25 ? prompt.slice(0, 25) + "..." : prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="flex-shrink-0 p-4 sm:p-6 pt-0">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Share what's on your mind..."
                      className="resize-none bg-white/70 border-gray-300/50 text-sm backdrop-blur-sm bg-slate-500"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(inputMessage)
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6 order-1 xl:order-2">
            {/* YouTube Music Player */}
            <YouTubePlayer selectedBackground={selectedBackground} />

            {/* Background Selector */}
            {showBackgroundSelector && (
              <Card
                className={`${selectedBackground.chatboxStyle} shadow-xl transition-all duration-1000 border-white/20`}
                style={getChatboxBackgroundStyle()}
              >
                <CardHeader>
                  <CardTitle className="text-gray-800 text-lg">Choose Your Ambiance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {backgrounds.map((bg) => {
                      const IconComponent = bg.icon
                      return (
                        <Button
                          key={bg.id}
                          variant="outline"
                          className={`h-20 p-2 flex flex-col items-center gap-1 relative overflow-hidden transition-all duration-300 ${
                            selectedBackground.id === bg.id
                              ? "ring-2 ring-blue-500 border-blue-500"
                              : "border-gray-300/50 hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedBackground(bg)}
                          style={{
                            backgroundImage: bg.image
                              ? `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(${bg.image})`
                              : `linear-gradient(135deg, ${bg.gradient.replace("from-", "").replace("to-", "").replace(" ", ", ")})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <IconComponent className="w-4 h-4 text-gray-700 relative z-10" />
                          <span className="text-xs font-medium text-gray-700 relative z-10">{bg.name}</span>
                          {selectedBackground.id === bg.id && (
                            <div className="absolute inset-0 bg-blue-500/20 rounded-md" />
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wellness Tips */}
            <Card
              className={`${selectedBackground.chatboxStyle} shadow-xl transition-all duration-1000 border-white/20`}
              style={getChatboxBackgroundStyle()}
            >
              <CardHeader>
                <CardTitle className="text-gray-800 text-lg flex items-center gap-2">
                  <Smile className="w-5 h-5 text-yellow-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-100/60 rounded-lg backdrop-blur-sm">
                    <p className="font-medium text-blue-800">Deep Breathing</p>
                    <p className="text-blue-700">Inhale for 4, hold for 4, exhale for 6</p>
                  </div>
                  <div className="p-3 bg-green-100/60 rounded-lg backdrop-blur-sm">
                    <p className="font-medium text-green-800">5-4-3-2-1 Technique</p>
                    <p className="text-green-700">Name 5 things you see, 4 you hear, 3 you touch</p>
                  </div>
                  <div className="p-3 bg-purple-100/60 rounded-lg backdrop-blur-sm">
                    <p className="font-medium text-purple-800">Progressive Relaxation</p>
                    <p className="text-purple-700">Tense and release each muscle group</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function VoiceTutorPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [subject, setSubject] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("intermediate")
  const [sessionActive, setSessionActive] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm Rachelle, your AI voice tutor. I'm here to help you practice active recall through conversation. Choose a subject and difficulty level, then let's start learning together!",
          timestamp: new Date(),
        },
      ])
    }
  }, [messages.length])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Convert speech to text
      const formData = new FormData()
      formData.append("audio", audioBlob, "audio.wav")

      const sttResponse = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData,
      })

      if (!sttResponse.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const { transcript } = await sttResponse.json()

      if (!transcript.trim()) {
        toast({
          title: "No Speech Detected",
          description: "I couldn't hear anything. Please try speaking again.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Add user message
      const userMessage: Message = {
        role: "user",
        content: transcript,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Get AI response
      const tutorResponse = await fetch("/api/voice/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: transcript,
          subject,
          difficulty,
          sessionHistory: messages.slice(-10), // Last 10 messages for context
        }),
      })

      if (!tutorResponse.ok) {
        throw new Error("Failed to get tutor response")
      }

      const { response } = await tutorResponse.json()

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Convert response to speech
      await playTTSResponse(response)
    } catch (error) {
      console.error("Error processing audio:", error)
      toast({
        title: "Processing Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const playTTSResponse = async (text: string) => {
    try {
      const response = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          // Limit reached
          const errorData = await response.json()
          toast({
            title: "Daily Limit Reached",
            description: errorData.message || "You've used all your voice tutor time for today.",
            variant: "destructive",
          })
        } else {
          throw new Error("Failed to generate speech")
        }
        return // Stop further processing if not ok
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing TTS:", error)
      toast({
        title: "Audio Error",
        description: "Could not play audio response.",
        variant: "destructive",
      })
    }
  }

  const startNewSession = () => {
    setMessages([
      {
        role: "assistant",
        content: `Great! Let's start a new ${difficulty} level session${subject ? ` on ${subject}` : ""}. I'll help you practice active recall. What topic would you like to review first?`,
        timestamp: new Date(),
      },
    ])
    setSessionActive(true)
  }

  const resetSession = () => {
    setMessages([])
    setSessionActive(false)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Voice AI Tutor</h1>
        <p className="text-muted-foreground">Practice active recall with Rachelle, your AI voice tutor</p>
      </div>

      {/* Session Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Subject</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={startNewSession} disabled={sessionActive}>
              Start New Session
            </Button>
            <Button variant="outline" onClick={resetSession}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="h-16 w-16 rounded-full"
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? "Recording... Click to stop"
                  : isProcessing
                    ? "Processing..."
                    : "Click to start speaking"}
              </p>
              {isProcessing && (
                <div className="flex justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Conversation
            {isPlaying && <Badge variant="secondary">Playing Audio</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => playTTSResponse(message.content)}
                        className="p-1 h-6 w-6"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
    </div>
  )
}

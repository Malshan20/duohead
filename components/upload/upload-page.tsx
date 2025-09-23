"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, ImageIcon, Mic, Brain, Loader2, CheckCircle, Plus } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { CreateSubjectDialog } from "./create-subject-dialog"
// First, import the subscription limit utilities
import { hasReachedLimit, type SubscriptionTier } from "@/lib/subscription-limits"

interface UploadedFile {
  file: File
  preview?: string
  type: "pdf" | "image" | "audio" | "text"
}

interface Subject {
  id: string
  name: string
  color: string
}

export function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showCreateSubject, setShowCreateSubject] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
  })
  const { toast } = useToast()
  const supabase = createClient()
  // Add a state for tracking monthly usage
  const [monthlyUsage, setMonthlyUsage] = useState({
    documents: 0,
  })
  const [tier, setTier] = useState<SubscriptionTier>("Seedling")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Add this call to fetchMonthlyUsage in the fetchSubjects function
      // After getting the user data
      if (user) {
        await fetchMonthlyUsage(user.id)
      }

      const { data, error } = await supabase.from("subjects").select("id, name, color").order("name")

      if (error) throw error

      if (!data || data.length === 0) {
        // If no subjects exist at all, you might want to create some global defaults
        // or just show an empty state
        setSubjects([])
      } else {
        setSubjects(data || [])
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      toast({
        title: "Error loading subjects",
        description: "Failed to load subjects from database.",
        variant: "destructive",
      })
    }
  }

  // Add this to the fetchSubjects function, after getting the user
  // This will fetch the user's monthly usage
  const fetchMonthlyUsage = async (userId: string) => {
    try {
      // Get the first day of the current month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Count documents uploaded this month
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", firstDayOfMonth.toISOString())

      if (error) throw error

      setMonthlyUsage((prev) => ({
        ...prev,
        documents: count || 0,
      }))

      // Fetch the user's subscription tier and update the state
      const { data: profileData } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single()

      if (profileData?.subscription_tier) {
        setTier(profileData.subscription_tier as SubscriptionTier)
      }
    } catch (error) {
      console.error("Error fetching monthly usage:", error)
    }
  }

  const createDefaultSubjects = async (userId: string) => {
    const defaultSubjects = [
      { name: "General", color: "#6B7280" },
      { name: "Mathematics", color: "#3B82F6" },
      { name: "Science", color: "#10B981" },
      { name: "History", color: "#F59E0B" },
      { name: "Literature", color: "#8B5CF6" },
    ]

    try {
      // Check which subjects already exist for this user
      const { data: existingSubjects } = await supabase.from("subjects").select("name").eq("user_id", userId)

      const existingNames = existingSubjects?.map((s) => s.name) || []

      // Filter out subjects that already exist
      const subjectsToCreate = defaultSubjects.filter((subject) => !existingNames.includes(subject.name))

      if (subjectsToCreate.length > 0) {
        const { error } = await supabase.from("subjects").insert(
          subjectsToCreate.map((subject) => ({
            ...subject,
            user_id: userId,
          })),
        )

        if (error) {
          console.error("Error creating default subjects:", error)
          // Don't throw here, just log the error
        }
      }
    } catch (error) {
      console.error("Error in createDefaultSubjects:", error)
      // Don't throw here to prevent blocking the UI
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileType = getFileType(file)
      return {
        file,
        type: fileType,
        preview: fileType === "image" ? URL.createObjectURL(file) : undefined,
      }
    })
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "audio/*": [".mp3", ".wav", ".m4a"],
      "text/*": [".txt", ".md"],
    },
    multiple: true,
  })

  const getFileType = (file: File): "pdf" | "image" | "audio" | "text" => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("audio/")) return "audio"
    if (file.type === "application/pdf") return "pdf"
    return "text"
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case "audio":
        return <Mic className="h-8 w-8 text-purple-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") {
      return await file.text()
    }

    // For other file types, we'll simulate text extraction
    // In a real app, you'd use libraries like pdf-parse, tesseract.js, etc.
    return `Content extracted from ${file.name}. This is a placeholder for the actual content that would be extracted using appropriate libraries.`
  }

  const handleUpload = async () => {
    // Add this at the beginning of the handleUpload function
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Check if the user has reached their document upload limit
    if (hasReachedLimit(tier, "documents_per_month", monthlyUsage.documents + files.length)) {
      toast({
        title: "Upload limit reached",
        description: `You've reached your monthly document upload limit. Upgrade your plan for more uploads.`,
        variant: "destructive",
      })
      return
    }

    if (files.length === 0 || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please add files and provide a title.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Get subject ID
      let subjectId = formData.subject
      if (!subjectId && subjects.length > 0) {
        // Use the first subject as default
        subjectId = subjects[0].id
      }

      setProgress(20)

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const uploadedFile = files[i]

        // Extract text content (basic extraction without AI)
        const content = await extractTextFromFile(uploadedFile.file)
        setProgress(40 + (i * 40) / files.length)

        // Upload file to Supabase Storage (simulated)
        const fileName = `${Date.now()}-${uploadedFile.file.name}`
        const filePath = `documents/${user.id}/${fileName}`

        // Insert document record without AI summary
        const { data: document, error: docError } = await supabase
          .from("documents")
          .insert({
            title: formData.title + (files.length > 1 ? ` (${i + 1})` : ""),
            content,
            summary: formData.description || "No summary available", // Use description or default
            type: uploadedFile.type,
            file_path: filePath,
            user_id: user.id,
            subject_id: subjectId,
          })
          .select()
          .single()

        if (docError) throw docError

        setProgress(80 + (i * 20) / files.length)
      }

      setProgress(100)

      toast({
        title: "Upload successful!",
        description: `${files.length} file(s) uploaded successfully.`,
      })

      // Reset form
      setFiles([])
      setFormData({ title: "", subject: "", description: "" })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject])
    setFormData({ ...formData, subject: newSubject.id })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Study Materials</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload your documents, images, or audio files and let AI organize and summarize them for you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Drag and drop your files here, or click to browse. Supports PDF, images, audio, and text files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-green-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-gray-500">PDF, Images, Audio, Text files supported</p>
                </div>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm">{file.file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Provide information about your study materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Chapter 5: Photosynthesis"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowCreateSubject(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional notes about this material..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading files...</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Add a display of the remaining uploads near the upload button
            Add this before the upload button in the CardFooter */}
            <div className="text-sm text-gray-500 mb-2">
              {tier !== "Jungle Master" && (
                <p>
                  {monthlyUsage.documents} / {tier === "Seedling" ? "10" : "50"} documents uploaded this month
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0 || !formData.title}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            Available AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Smart Summarization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate AI summaries from your uploaded materials in the Study Materials section
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Auto Flashcards</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create study flashcards from your documents using AI
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">AI Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about your documents with the AI tutor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateSubjectDialog
        open={showCreateSubject}
        onOpenChange={setShowCreateSubject}
        onSubjectCreated={handleSubjectCreated}
      />
    </div>
  )
}

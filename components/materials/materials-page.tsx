"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Search,
  Brain,
  BookOpen,
  Clock,
  MessageSquare,
  Download,
  Share2,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ChatInterface } from "@/components/ai/chat-interface"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Document {
  id: string
  title: string
  summary: string
  content: string
  type: string
  created_at: string
  subject?: {
    name: string
    color: string
  } | null
}

export function StudyMaterialsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredDocuments(filtered)
    } else {
      setFilteredDocuments(documents)
    }
  }, [searchQuery, documents])

  const fetchDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          subject:subjects(name, color)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Handle documents without subjects
      const documentsWithDefaults = (data || []).map((doc) => ({
        ...doc,
        subject: doc.subject || { name: "General", color: "#6B7280" },
      }))

      setDocuments(documentsWithDefaults)
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      setDeletingId(documentId)
      const { error } = await supabase.from("documents").delete().eq("id", documentId)

      if (error) throw error

      // Remove from local state
      setDocuments(documents.filter((doc) => doc.id !== documentId))

      // Clear selected document if it was deleted
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null)
      }

      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleAskAI = (document: Document) => {
    setSelectedDocument(document)
    setActiveTab("chat")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your organized study materials with AI chat support.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No study materials yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your first document to get started with AI-powered learning.
            </p>
            <Button>Upload Materials</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocuments.map((document) => (
              <Card
                key={document.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDocument?.id === document.id ? "ring-2 ring-green-500" : ""
                }`}
                onClick={() => setSelectedDocument(document)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${document.subject?.color || "#6B7280"}20`,
                              color: document.subject?.color || "#6B7280",
                            }}
                          >
                            {document.subject?.name || "General"}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(document.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === document.id}
                          >
                            {deletingId === document.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              Delete Document
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{document.title}"? This action cannot be undone and will
                              permanently remove the document and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDocument(document.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Document
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{document.summary}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAskAI(document)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Assistant Panel */}
          <div className="space-y-4">
            {selectedDocument ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="chat">AI Chat</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedDocument.title}</CardTitle>
                      <CardDescription>Document overview and actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Summary
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDocument.summary}</p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            if (!selectedDocument) return
                            try {
                              const response = await fetch("/api/ai/explain", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  concept: "key concepts",
                                  documentContent: selectedDocument.content,
                                }),
                              })

                              if (!response.ok) throw new Error("Failed to explain concepts")

                              const { explanation } = await response.json()

                              toast({
                                title: "Key Concepts Explained",
                                description: "AI explanation has been generated. Check the chat tab for details.",
                              })

                              // Switch to chat tab
                              setActiveTab("chat")
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to explain concepts. Please try again.",
                                variant: "destructive",
                              })
                            }
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Explain Key Concepts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chat">
                  <ChatInterface
                    context={`Document: ${selectedDocument.title}

Content: ${selectedDocument.content.substring(0, 1000)}...`}
                    placeholder="Ask about this document..."
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">AI Assistant Ready</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a document to start interacting with AI features.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

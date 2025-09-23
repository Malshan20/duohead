"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CreateSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubjectCreated: (subject: any) => void
}

const subjectColors = [
  "#10B981", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
]

export function CreateSubjectDialog({ open, onOpenChange, onSubjectCreated }: CreateSubjectDialogProps) {
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(subjectColors[0])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("subjects")
        .insert({
          name: name.trim(),
          color: selectedColor,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Subject created",
        description: `${name} has been added to your subjects.`,
      })

      onSubjectCreated(data)
      setName("")
      setSelectedColor(subjectColors[0])
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error creating subject",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>Add a new subject to organize your study materials.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Biology, Mathematics, History"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {subjectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? "border-gray-900 dark:border-white" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { createClient } from "./client"
import { createServerClient as createServerClient } from "./server"

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  status: string
  user_id?: string | null
  ticket_number?: string
  source?: "contact" | "chatbot"
}

export interface ContactMessageResponse {
  id: string
  ticket_number: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
  source: string
}

export async function insertContactMessage(data: ContactMessage): Promise<ContactMessageResponse> {
  const supabase = createServerClient()

  const { data: result, error } = await supabase
    .from("contact_messages")
    .insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: data.status || "pending",
      user_id: data.user_id || null,
      source: data.source || "contact",
    })
    .select("*")
    .single()

  if (error) {
    console.error("Error inserting contact message:", error)
    throw new Error(`Failed to submit contact message: ${error.message}`)
  }

  return result as ContactMessageResponse
}

export async function getContactMessages(): Promise<ContactMessageResponse[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contact messages:", error)
    throw new Error(`Failed to fetch contact messages: ${error.message}`)
  }

  return data as ContactMessageResponse[]
}

export async function updateContactMessageStatus(id: string, status: string): Promise<ContactMessageResponse> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("Error updating contact message:", error)
    throw new Error(`Failed to update contact message: ${error.message}`)
  }

  return data as ContactMessageResponse
}

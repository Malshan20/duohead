import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface ContactMessage {
  id?: string
  name: string
  email: string
  message?: string
  subject?: string
  status?: string
  user_id?: string | null
  created_at?: string
  updated_at?: string
  source?: "contact" | "chatbot"
}

// Function to insert a new contact message
export async function insertContactMessage(data: Omit<ContactMessage, "id" | "created_at" | "updated_at">) {
  const contactData = {
    name: data.name,
    email: data.email,
    message: data.message || "General inquiry from chatbot",
    subject: data.subject || "Chatbot Support Request",
    status: data.status || "pending",
    user_id: data.user_id || null,
  }

  const { data: result, error } = await supabase.from("contact_messages").insert([contactData]).select().single()

  if (error) {
    console.error("Error inserting contact message:", error)
    throw error
  }

  return result
}

// Function to get all contact messages (for admin use)
export async function getContactMessages() {
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contact messages:", error)
    throw error
  }

  return data
}

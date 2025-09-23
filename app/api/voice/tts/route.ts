import { type NextRequest, NextResponse } from "next/server"

import { SUBSCRIPTION_LIMITS, type SubscriptionTier } from "@/lib/subscription-limits"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const RACHELLE_VOICE_ID = "ZT9u07TYPVl83ejeLakq"
const CHARS_PER_SECOND_ESTIMATE = 10 // Adjusted for more conservative estimation

async function getOrCreateDailyUsage(supabase: any, userId: string) {
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  let { data: usage, error } = await supabase
    .from("daily_voice_tutor_usage")
    .select("id, duration_seconds_today")
    .eq("user_id", userId)
    .eq("date", today)
    .single()

  if (error && error.code === "PGRST116") {
    // "PGRST116" is "No rows found"
    // Create new usage entry for the day
    const { data: newUsage, error: insertError } = await supabase
      .from("daily_voice_tutor_usage")
      .insert({ user_id: userId, date: today, duration_seconds_today: 0 })
      .select("id, duration_seconds_today")
      .single()

    if (insertError) {
      console.error("Error creating daily usage entry:", insertError)
      throw insertError
    }
    usage = newUsage
  } else if (error) {
    console.error("Error fetching daily usage:", error)
    throw error
  }
  return usage
}

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
  }

  try {
    const { text } = await request.json()
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's subscription tier
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile or profile not found:", profileError)
      return NextResponse.json({ error: "Could not determine subscription tier." }, { status: 500 })
    }

    const tier = (profile.subscription_tier as SubscriptionTier) || "Seedling" // Default to Seedling if null
    const dailyLimitSeconds = SUBSCRIPTION_LIMITS[tier]?.voice_tutor_daily_seconds

    if (dailyLimitSeconds === undefined) {
      console.error(`Voice tutor limit not defined for tier: ${tier}`)
      return NextResponse.json({ error: "Voice tutor limit not configured for your plan." }, { status: 500 })
    }

    if (dailyLimitSeconds === "Unlimited") {
      // Though current plans have numbers
      // No limit check needed if unlimited
    } else {
      const usageRecord = await getOrCreateDailyUsage(supabase, user.id)
      const currentUsageSeconds = usageRecord.duration_seconds_today

      // Estimate duration of current TTS request
      const estimatedDurationSeconds = Math.ceil(text.length / CHARS_PER_SECOND_ESTIMATE)

      if (currentUsageSeconds + estimatedDurationSeconds > dailyLimitSeconds) {
        const timeLeftToday = Math.max(0, dailyLimitSeconds - currentUsageSeconds)
        return NextResponse.json(
          {
            error: "Daily voice tutor limit reached.",
            message: `You have ${timeLeftToday} seconds remaining today. Please upgrade or try again tomorrow.`,
          },
          { status: 429 }, // Too Many Requests
        )
      }
    }

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${RACHELLE_VOICE_ID}/stream`
    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // Or your preferred model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("ElevenLabs API Error:", response.status, errorBody)
      return NextResponse.json({ error: `ElevenLabs API error: ${errorBody}` }, { status: response.status })
    }

    // If limit was not "Unlimited", update usage
    if (typeof dailyLimitSeconds === "number") {
      const estimatedDurationSeconds = Math.ceil(text.length / CHARS_PER_SECOND_ESTIMATE)
      const usageRecord = await getOrCreateDailyUsage(supabase, user.id) // Fetch again to be safe or use previous

      const { error: updateError } = await supabase
        .from("daily_voice_tutor_usage")
        .update({ duration_seconds_today: usageRecord.duration_seconds_today + estimatedDurationSeconds })
        .eq("id", usageRecord.id)

      if (updateError) {
        console.error("Error updating daily usage:", updateError)
        // Non-critical, proceed with returning audio but log error
      }
    }

    // Stream the audio back
    const audioBlob = await response.blob()
    return new NextResponse(audioBlob, {
      headers: { "Content-Type": "audio/mpeg" },
    })
  } catch (error: any) {
    console.error("TTS Error:", error)
    return NextResponse.json({ error: "Failed to generate speech. " + (error.message || "") }, { status: 500 })
  }
}

import type { Metadata } from "next"
import { VoiceTutorPage } from "@/components/voice-tutor/voice-tutor-page"

export const metadata: Metadata = {
  title: "Voice AI Tutor - Second Brain",
  description: "Practice active recall with your AI voice tutor",
}

export default function VoiceTutorPageRoute() {
  return <VoiceTutorPage />
}

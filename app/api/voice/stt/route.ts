import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    const audioBuffer = await audioFile.arrayBuffer()

    const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/wav",
      },
      body: audioBuffer,
    })

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`)
    }

    const result = await response.json()
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("STT Error:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}

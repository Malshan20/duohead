import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // For simplicity and reliability, we'll use a predefined set of music tracks
    // based on common mood/theme keywords in the query
    const queryLower = query.toLowerCase()

    let results = []

    // Relaxation music
    if (
      queryLower.includes("relax") ||
      queryLower.includes("calm") ||
      queryLower.includes("peace") ||
      queryLower.includes("stress") ||
      queryLower.includes("anxiety")
    ) {
      results = [
        {
          id: "relax1",
          title: "Weightless",
          artist: "Marconi Union",
          videoId: "UfcAVejslrU",
          thumbnail: "https://img.youtube.com/vi/UfcAVejslrU/mqdefault.jpg",
          duration: "8:10",
        },
        {
          id: "relax2",
          title: "Relaxing Piano Music",
          artist: "Relaxation Music",
          videoId: "lCOF9LN_Zxs",
          thumbnail: "https://img.youtube.com/vi/lCOF9LN_Zxs/mqdefault.jpg",
          duration: "3:00:00",
        },
        {
          id: "relax3",
          title: "Peaceful Nature Sounds",
          artist: "Nature Relaxation",
          videoId: "eKFTSSKCzWA",
          thumbnail: "https://img.youtube.com/vi/eKFTSSKCzWA/mqdefault.jpg",
          duration: "3:00:00",
        },
      ]
    }
    // Focus music
    else if (
      queryLower.includes("focus") ||
      queryLower.includes("study") ||
      queryLower.includes("concentrate") ||
      queryLower.includes("work") ||
      queryLower.includes("productivity")
    ) {
      results = [
        {
          id: "focus1",
          title: "Lofi Hip Hop - Beats to Study/Relax to",
          artist: "Lofi Girl",
          videoId: "5qap5aO4i9A",
          thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg",
          duration: "Live",
        },
        {
          id: "focus2",
          title: "Deep Focus Music",
          artist: "Concentration Music",
          videoId: "Hw4ctvV6oXk",
          thumbnail: "https://img.youtube.com/vi/Hw4ctvV6oXk/mqdefault.jpg",
          duration: "3:00:00",
        },
        {
          id: "focus3",
          title: "Ambient Study Music",
          artist: "Focus Music",
          videoId: "sjkrrmBnpGE",
          thumbnail: "https://img.youtube.com/vi/sjkrrmBnpGE/mqdefault.jpg",
          duration: "1:00:00",
        },
      ]
    }
    // Sleep music
    else if (
      queryLower.includes("sleep") ||
      queryLower.includes("night") ||
      queryLower.includes("insomnia") ||
      queryLower.includes("bed") ||
      queryLower.includes("dream")
    ) {
      results = [
        {
          id: "sleep1",
          title: "Deep Sleep Music",
          artist: "Sleep Sounds",
          videoId: "bP9gMpl1gyQ",
          thumbnail: "https://img.youtube.com/vi/bP9gMpl1gyQ/mqdefault.jpg",
          duration: "10:00:00",
        },
        {
          id: "sleep2",
          title: "Rain Sounds for Sleeping",
          artist: "Nature Sounds",
          videoId: "yIQd2Ya0Ziw",
          thumbnail: "https://img.youtube.com/vi/yIQd2Ya0Ziw/mqdefault.jpg",
          duration: "8:00:00",
        },
        {
          id: "sleep3",
          title: "Relaxing Sleep Music",
          artist: "Meditation Relax Music",
          videoId: "FjHGZj2IjBk",
          thumbnail: "https://img.youtube.com/vi/FjHGZj2IjBk/mqdefault.jpg",
          duration: "3:00:00",
        },
      ]
    }
    // Uplifting music
    else if (
      queryLower.includes("happy") ||
      queryLower.includes("uplift") ||
      queryLower.includes("motivat") ||
      queryLower.includes("energy") ||
      queryLower.includes("positive")
    ) {
      results = [
        {
          id: "uplift1",
          title: "Happy Background Music",
          artist: "Uplifting Music",
          videoId: "he0yW5tMcOA",
          thumbnail: "https://img.youtube.com/vi/he0yW5tMcOA/mqdefault.jpg",
          duration: "1:00:00",
        },
        {
          id: "uplift2",
          title: "Positive Energy Music",
          artist: "Good Vibes",
          videoId: "TGan48YE9Us",
          thumbnail: "https://img.youtube.com/vi/TGan48YE9Us/mqdefault.jpg",
          duration: "2:00:00",
        },
        {
          id: "uplift3",
          title: "Morning Motivation Music",
          artist: "Motivation Music",
          videoId: "WPni755-Krg",
          thumbnail: "https://img.youtube.com/vi/WPni755-Krg/mqdefault.jpg",
          duration: "1:00:00",
        },
      ]
    }
    // Default/fallback music
    else {
      results = [
        {
          id: "default1",
          title: "Beautiful Piano Music",
          artist: "Relaxing Music",
          videoId: "y7e-GC6oGhg",
          thumbnail: "https://img.youtube.com/vi/y7e-GC6oGhg/mqdefault.jpg",
          duration: "3:00:00",
        },
        {
          id: "default2",
          title: "Ambient Music for Studying",
          artist: "Study Music",
          videoId: "sjkrrmBnpGE",
          thumbnail: "https://img.youtube.com/vi/sjkrrmBnpGE/mqdefault.jpg",
          duration: "1:00:00",
        },
        {
          id: "default3",
          title: "Relaxing Guitar Music",
          artist: "Acoustic Relaxation",
          videoId: "EEJOVy8dCX0",
          thumbnail: "https://img.youtube.com/vi/EEJOVy8dCX0/mqdefault.jpg",
          duration: "2:00:00",
        },
      ]
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Music search error:", error)

    // Return fallback music suggestions
    const fallbackResults = [
      {
        id: "fallback1",
        title: "Calming Music for Stress Relief",
        artist: "Relaxing Music",
        videoId: "lCOF9LN_Zxs",
        thumbnail: "https://img.youtube.com/vi/lCOF9LN_Zxs/mqdefault.jpg",
        duration: "3:00:00",
      },
      {
        id: "fallback2",
        title: "Focus Music - Deep Concentration",
        artist: "Study Music",
        videoId: "sjkrrmBnpGE",
        thumbnail: "https://img.youtube.com/vi/sjkrrmBnpGE/mqdefault.jpg",
        duration: "1:00:00",
      },
    ]

    return NextResponse.json({ results: fallbackResults })
  }
}

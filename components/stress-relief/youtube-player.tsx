"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Volume2, VolumeX, Search, Music, Heart, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMusic } from "@/lib/music-context"

interface MusicTrack {
  id: string
  title: string
  artist: string
  videoId: string
  thumbnail: string
  duration: string
}

interface MoodPlaylist {
  id: string
  name: string
  emoji: string
  description: string
  tracks: MusicTrack[]
}

const moodPlaylists: MoodPlaylist[] = [
  {
    id: "relaxation",
    name: "Relaxation",
    emoji: "🧘",
    description: "Calm your mind and body",
    tracks: [
      {
        id: "1",
        title: "Weightless",
        artist: "Marconi Union",
        videoId: "UfcAVejslrU",
        thumbnail: "https://img.youtube.com/vi/UfcAVejslrU/mqdefault.jpg",
        duration: "8:10",
      },
      {
        id: "2",
        title: "Aqueous Transmission",
        artist: "Incubus",
        videoId: "eQK7KSTQfaw",
        thumbnail: "https://img.youtube.com/vi/eQK7KSTQfaw/mqdefault.jpg",
        duration: "7:49",
      },
      {
        id: "3",
        title: "Clair de Lune",
        artist: "Claude Debussy",
        videoId: "CvFH_6DNRCY",
        thumbnail: "https://img.youtube.com/vi/CvFH_6DNRCY/mqdefault.jpg",
        duration: "5:20",
      },
    ],
  },
  {
    id: "focus",
    name: "Focus",
    emoji: "😌",
    description: "Enhance concentration",
    tracks: [
      {
        id: "4",
        title: "Lofi Hip Hop Study Mix",
        artist: "ChilledCow",
        videoId: "5qap5aO4i9A",
        thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg",
        duration: "1:00:00",
      },
      {
        id: "5",
        title: "Forest Sounds",
        artist: "Nature Sounds",
        videoId: "xNN7iTA57jM",
        thumbnail: "https://img.youtube.com/vi/xNN7iTA57jM/mqdefault.jpg",
        duration: "3:00:00",
      },
    ],
  },
  {
    id: "uplifting",
    name: "Uplifting",
    emoji: "😊",
    description: "Boost your mood",
    tracks: [
      {
        id: "6",
        title: "Here Comes the Sun",
        artist: "The Beatles",
        videoId: "KQetemT1sWc",
        thumbnail: "https://img.youtube.com/vi/KQetemT1sWc/mqdefault.jpg",
        duration: "3:05",
      },
      {
        id: "7",
        title: "Good Vibrations",
        artist: "The Beach Boys",
        videoId: "Eab_beh07HU",
        thumbnail: "https://img.youtube.com/vi/Eab_beh07HU/mqdefault.jpg",
        duration: "3:36",
      },
    ],
  },
  {
    id: "sleep",
    name: "Sleep",
    emoji: "😴",
    description: "Peaceful rest",
    tracks: [
      {
        id: "8",
        title: "Rain Sounds for Sleeping",
        artist: "Nature Sounds",
        videoId: "mPZkdNFkNps",
        thumbnail: "https://img.youtube.com/vi/mPZkdNFkNps/mqdefault.jpg",
        duration: "8:00:00",
      },
      {
        id: "9",
        title: "Gymnopédie No. 1",
        artist: "Erik Satie",
        videoId: "S-Xm7s9eGM0",
        thumbnail: "https://img.youtube.com/vi/S-Xm7s9eGM0/mqdefault.jpg",
        duration: "4:33",
      },
    ],
  },
]

interface YouTubePlayerProps {
  selectedBackground: any
}

export function YouTubePlayer({ selectedBackground }: YouTubePlayerProps) {
  const { currentTrack, isPlaying, isMuted, playTrack, togglePlayPause, toggleMute } = useMusic()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string>("relaxation")
  const { toast } = useToast()

  const getChatboxBackgroundStyle = () => {
    if (selectedBackground.chatboxImage) {
      return {
        backgroundImage: selectedBackground.chatboxImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    }
    return {}
  }

  const handlePlayTrack = (track: MusicTrack) => {
    playTrack(track)
    toast({
      title: "Now Playing",
      description: `${track.title} by ${track.artist}`,
    })
  }

  const searchMusic = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/ai/music-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Music search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for music. Please try again.",
        variant: "destructive",
      })
      // Set some fallback results
      setSearchResults([
        {
          id: "fallback1",
          title: "Relaxing Piano Music",
          artist: "Relaxation Music",
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
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchMusic()
    }
  }

  return (
    <Card
      className={`${selectedBackground.chatboxStyle} shadow-xl transition-all duration-1000 border-white/20`}
      style={getChatboxBackgroundStyle()}
    >
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-500" />
          Music Therapy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Track Display */}
        {currentTrack && (
          <div className="p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <img
                src={currentTrack.thumbnail || "/placeholder.svg"}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{currentTrack.title}</p>
                <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={togglePlayPause} className="h-8 w-8 p-0">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={toggleMute} className="h-8 w-8 p-0">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Music Search */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search for music... (e.g., 'calming piano music')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/70 border-gray-300/50 text-sm text-black"
            />
            <Button
              onClick={searchMusic}
              disabled={isSearching}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Search Results:</p>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 p-2 bg-white/50 rounded cursor-pointer hover:bg-white/70 transition-colors"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <img
                        src={track.thumbnail || "/placeholder.svg"}
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{track.title}</p>
                        <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                      </div>
                      <Play className="w-3 h-3 text-gray-600" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Mood Selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Choose Your Mood:</p>
          <div className="grid grid-cols-2 gap-2">
            {moodPlaylists.map((mood) => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood.id)}
                className={`h-auto p-2 flex flex-col items-center gap-1 ${
                  selectedMood === mood.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : "bg-white/50 hover:bg-white/70 text-gray-700"
                }`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Mood Playlist */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {moodPlaylists.find((m) => m.id === selectedMood)?.description}
          </p>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {moodPlaylists
                .find((m) => m.id === selectedMood)
                ?.tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      currentTrack?.id === track.id ? "bg-purple-100/70" : "bg-white/50 hover:bg-white/70"
                    }`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <img
                      src={track.thumbnail || "/placeholder.svg"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{track.title}</p>
                      <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{track.duration}</span>
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Music Tips */}
        <div className="p-3 bg-gradient-to-r from-purple-100/60 to-pink-100/60 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-medium text-purple-800 mb-1">🎵 Music Therapy Tip</p>
          <p className="text-xs text-purple-700">
            Music can reduce cortisol levels by up to 25%. Choose tracks that match your desired emotional state.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

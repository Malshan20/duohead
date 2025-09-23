"use client"

import { useState, useEffect } from "react"
import { useMusic } from "@/lib/music-context"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Minimize2, Maximize2, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function MiniPlayer() {
  const { currentTrack, isPlaying, isMuted, volume, togglePlayPause, toggleMute, setVolume, clearTrack } = useMusic()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(!!currentTrack)
  }, [currentTrack])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? "w-80" : "w-60"
      }`}
    >
      <div className="p-3 flex items-center gap-3">
        {/* Thumbnail */}
        <img
          src={currentTrack?.thumbnail || "/placeholder.svg"}
          alt={currentTrack?.title || "Music"}
          className="w-10 h-10 rounded object-cover"
        />

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{currentTrack?.title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentTrack?.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={togglePlayPause} className="h-8 w-8 p-0">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleMute} className="h-8 w-8 p-0">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearTrack} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Hidden YouTube Player */}
      {currentTrack && (
        <div className="hidden">
          <iframe
            width="0"
            height="0"
            src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${
              isMuted ? 1 : 0
            }&loop=1&playlist=${currentTrack.videoId}`}
            allow="autoplay"
          />
        </div>
      )}
    </div>
  )
}

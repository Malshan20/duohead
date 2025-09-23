"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface MusicTrack {
  id: string
  title: string
  artist: string
  videoId: string
  thumbnail: string
  duration: string
}

interface MusicContextType {
  currentTrack: MusicTrack | null
  isPlaying: boolean
  isMuted: boolean
  volume: number
  playTrack: (track: MusicTrack) => void
  pauseTrack: () => void
  resumeTrack: () => void
  togglePlayPause: () => void
  toggleMute: () => void
  setVolume: (volume: number) => void
  clearTrack: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolumeState] = useState(50)

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTrack = localStorage.getItem("currentTrack")
        const savedIsPlaying = localStorage.getItem("isPlaying")
        const savedIsMuted = localStorage.getItem("isMuted")
        const savedVolume = localStorage.getItem("volume")

        if (savedTrack) setCurrentTrack(JSON.parse(savedTrack))
        if (savedIsPlaying) setIsPlaying(savedIsPlaying === "true")
        if (savedIsMuted) setIsMuted(savedIsMuted === "true")
        if (savedVolume) setVolumeState(Number.parseInt(savedVolume))
      } catch (error) {
        console.error("Error loading music state from localStorage:", error)
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("currentTrack", currentTrack ? JSON.stringify(currentTrack) : "")
        localStorage.setItem("isPlaying", String(isPlaying))
        localStorage.setItem("isMuted", String(isMuted))
        localStorage.setItem("volume", String(volume))
      } catch (error) {
        console.error("Error saving music state to localStorage:", error)
      }
    }
  }, [currentTrack, isPlaying, isMuted, volume])

  const playTrack = (track: MusicTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const pauseTrack = () => {
    setIsPlaying(false)
  }

  const resumeTrack = () => {
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
  }

  const clearTrack = () => {
    setCurrentTrack(null)
    setIsPlaying(false)
  }

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMuted,
        volume,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlayPause,
        toggleMute,
        setVolume,
        clearTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  return context
}

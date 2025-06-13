"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Volume2, VolumeX, Maximize, Users, Eye } from "lucide-react"
import Hls from "hls.js"
import { StreamHeader } from "@/components/stream-header"
import { useToast } from "@/components/ui/use-toast"

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [watchCode, setWatchCode] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [streamTitle, setStreamTitle] = useState("")
  const { toast } = useToast()

  // Handle joining a stream with watch code
  const handleJoinStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!watchCode.trim()) return

    setIsLoading(true)
    try {
      // Initialize HLS player with the watch code
      await initHls(watchCode.trim().toUpperCase())
      setIsWatching(true)
      setStreamTitle(`Stream ${watchCode.toUpperCase()}`)
      toast({
        title: "Connected to stream",
        description: "You are now watching the live stream.",
      })
    } catch (error) {
      console.error("Failed to join stream:", error)
      toast({
        title: "Failed to connect",
        description: "Please check the watch code and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize HLS player
  const initHls = async (code: string) => {
    if (!videoRef.current) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        startLevel: 2,
        enableWorker: true,
      })

      // Use the watch code to get the correct HLS stream
      const hlsUrl = `http://localhost:3001/hls/${code}/stream.m3u8`

      hls.loadSource(hlsUrl)
      hls.attachMedia(videoRef.current)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        videoRef.current
          ?.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Playback failed:", error)
            toast({
              title: "Playback failed",
              description: "Could not start the stream automatically.",
              variant: "destructive",
            })
          })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              toast({
                title: "Network error",
                description: "Trying to reconnect to the stream...",
                variant: "destructive",
              })
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              toast({
                title: "Media error",
                description: "Trying to recover...",
                variant: "destructive",
              })
              hls.recoverMediaError()
              break
            default:
              toast({
                title: "Stream error",
                description: "Could not load the stream.",
                variant: "destructive",
              })
              break
          }
        }
      })
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari which has native HLS support
      videoRef.current.src = `http://localhost:3001/hls/${code}/stream.m3u8`
      videoRef.current.addEventListener("loadedmetadata", () => {
        setIsLoading(false)
        videoRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Playback failed:", error))
      })
    } else {
      throw new Error("HLS not supported")
    }
  }

  // Simulate viewer count updates
  useEffect(() => {
    if (isWatching) {
      const interval = setInterval(() => {
        setViewerCount(Math.floor(Math.random() * 50) + 10)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isWatching])

  // Video control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Show watch code input if not watching
  if (!isWatching) {
    return (
      <div className="min-h-screen flex flex-col">
        <StreamHeader />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="w-full max-w-md mx-auto p-6">
            <Card className="p-8 border-2 border-blue-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                  Watch Live Stream
                </h1>
                <p className="text-gray-600">Enter a watch code to view a live stream</p>
              </div>

              <form onSubmit={handleJoinStream} className="space-y-4">
                <Input
                  placeholder="Enter watch code (e.g., WATCH123)"
                  value={watchCode}
                  onChange={(e) => setWatchCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={8}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !watchCode.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isLoading ? "Connecting..." : "Watch Stream"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  Get a watch code from someone who is streaming to view their live session.
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StreamHeader />

      <main className="flex-1 container mx-auto px-4 py-4">
        {/* Stream info */}
        <Card className="p-4 mb-4 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold mb-1">{streamTitle}</h1>
              <p className="text-gray-600 text-sm">Live HLS Stream</p>
            </div>
            <div className="flex items-center gap-1 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Users className="h-4 w-4" />
              <span>{viewerCount} viewers</span>
            </div>
          </div>
        </Card>

        {/* Video player */}
        <Card className="p-4 bg-white shadow-sm">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading stream...</p>
                </div>
              </div>
            )}

            <video ref={videoRef} className="w-full h-full object-cover" playsInline />

            {/* Video controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <span className="text-white text-sm ml-2">LIVE</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, Users } from "lucide-react"
import Hls from "hls.js"
import { StreamHeader } from "@/components/stream-header"
import { useToast } from "@/components/ui/use-toast"

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let hls: Hls

    const initHls = () => {
      if (videoRef.current) {
        if (Hls.isSupported()) {
          hls = new Hls({
            debug: false,
            startLevel: 2,
            enableWorker: true,
          })

          // Replace with actual HLS stream URL from your backend
          const hlsUrl = "http://localhost:3001/hls/stream.m3u8"

          hls.loadSource(hlsUrl)
          hls.attachMedia(videoRef.current)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false)
            videoRef.current
              ?.play()
              .then(() => {
                setIsPlaying(true)
                toast({
                  title: "Stream loaded",
                  description: "You are now watching the live stream.",
                })
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
          videoRef.current.src = "http://localhost:3001/hls/stream.m3u8"
          videoRef.current.addEventListener("loadedmetadata", () => {
            setIsLoading(false)
            videoRef.current
              ?.play()
              .then(() => setIsPlaying(true))
              .catch((error) => console.error("Playback failed:", error))
          })
        } else {
          toast({
            title: "HLS not supported",
            description: "Your browser does not support HLS playback.",
            variant: "destructive",
          })
        }
      }
    }

    // Simulate fetching viewer count
    const interval = setInterval(() => {
      // In a real app, this would be fetched from the server
      setViewerCount(Math.floor(Math.random() * 10) + 5)
    }, 5000)

    initHls()

    return () => {
      if (hls) {
        hls.destroy()
      }
      clearInterval(interval)
    }
  }, [])

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

  return (
    <div className="min-h-screen flex flex-col">
      <StreamHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Live Stream Playback</h1>
              <p className="text-muted-foreground">Watch the live interaction via HLS streaming</p>
            </div>
            <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Users className="h-4 w-4" />
              <span>{viewerCount} viewers</span>
            </div>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <video ref={videoRef} className="w-full h-full" playsInline />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
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

"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Users, Eye, Search, RefreshCw, Clock, Sparkles, ExternalLink, Radio } from "lucide-react"
import { StreamHeader } from "@/components/stream-header"
import { motion, AnimatePresence } from "framer-motion"

interface LiveStream {
  id: string
  title: string
  description: string
  viewerCount: number
  thumbnail: string
  isLive: boolean
  createdAt: string
  startTime: string
  roomCode: string
  watchCode: string
  hlsUrl?: string
}

export default function WatchPage() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)

  // Filter streams based on search
  const filteredStreams = streams.filter((stream) => {
    const matchesSearch =
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Fetch live streams from API
  const fetchLiveStreams = async () => {
    try {
      console.log("🔄 Fetching live streams...")
      const response = await fetch("http://localhost:3001/api/rooms/live")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log(`📺 Fetched ${data.rooms.length} live streams:`, data.rooms)
          setStreams(data.rooms)
        } else {
          console.error("❌ Failed to fetch streams:", data.error)
        }
      } else {
        console.error("❌ HTTP error:", response.status)
      }
    } catch (error) {
      console.error("❌ Failed to fetch live streams:", error)
    }
  }

  // Initial load
  useEffect(() => {
    const loadStreams = async () => {
      setIsLoading(true)
      await fetchLiveStreams()
      setIsLoading(false)
    }
    loadStreams()
  }, [])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchLiveStreams, 10000)
    return () => clearInterval(interval)
  }, [])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLiveStreams()
    setRefreshing(false)
  }

  // Load HLS stream when selected
  useEffect(() => {
    if (selectedStream && selectedStream.hlsUrl && videoRef.current) {
      const video = videoRef.current
      console.log(`🎥 Loading HLS stream: ${selectedStream.hlsUrl}`)

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      // Load HLS.js dynamically
      const loadHls = async () => {
        if (typeof window !== "undefined") {
          try {
            // Import HLS.js dynamically
            const HlsModule = await import("hls.js")
            const Hls = HlsModule.default

            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 30,
                maxBufferLength: 60,
              })

              hlsRef.current = hls
              hls.loadSource(`http://localhost:3001${selectedStream.hlsUrl}`)
              hls.attachMedia(video)

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("✅ HLS manifest parsed, starting playback")
                video.play().catch((error) => {
                  console.error("❌ Video play error:", error)
                })
              })

              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("❌ HLS error:", data)
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.log("🔄 Trying to recover from network error")
                      hls.startLoad()
                      break
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log("🔄 Trying to recover from media error")
                      hls.recoverMediaError()
                      break
                    default:
                      console.log("💥 Fatal error, destroying HLS")
                      hls.destroy()
                      break
                  }
                }
              })

              return () => {
                hls.destroy()
              }
            }
            // Fallback for browsers with native HLS support (Safari)
            else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = `http://localhost:3001${selectedStream.hlsUrl}`
              video.play().catch(console.error)
            }
          } catch (error) {
            console.error("❌ Error loading HLS.js:", error)
          }
        }
      }

      loadHls()
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [selectedStream])

  const handleWatchStream = (stream: LiveStream) => {
    console.log(`👀 Watching stream: ${stream.title}`)
    setSelectedStream(stream)
  }

  const handleJoinStream = (roomCode: string) => {
    // Open stream page to join as participant
    const url = `/stream?join=${roomCode}`
    console.log(`🚀 Opening stream page: ${url}`)
    window.open(url, "_blank")
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const streamTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - streamTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just started"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StreamHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 dark:from-red-950/20 dark:via-pink-950/20 dark:to-purple-950/20 py-12">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-full mb-6">
                <Radio className="h-4 w-4" />
                <span className="text-sm font-medium">Live Streams</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Watch Live Streams
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover amazing live content from creators. Join the conversation and watch in real-time.
              </p>
            </motion.div>

            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search live streams or room codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-red-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2 border-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {/* Live count */}
              <div className="text-center">
                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {filteredStreams.length} Live Stream{filteredStreams.length !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Player Modal */}
        <AnimatePresence>
          {selectedStream && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{selectedStream.title}</h2>
                      <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    </div>
                    <p className="text-muted-foreground">{selectedStream.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {selectedStream.viewerCount} viewers
                      </span>
                      <span>Room: {selectedStream.roomCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleJoinStream(selectedStream.roomCode)}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Join Stream
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedStream(null)}>
                      Close
                    </Button>
                  </div>
                </div>
                <div className="aspect-video bg-black relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    autoPlay
                    muted
                    playsInline
                    poster="/placeholder.svg?height=720&width=1280&text=Loading..."
                  />
                  {!selectedStream.hlsUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Stream starting...</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Streams Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading live streams...</p>
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{searchQuery ? "No streams found" : "No live streams"}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Be the first to go live! Create a room and start streaming."}
                </p>
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-200 dark:hover:border-red-800">
                      <div className="relative">
                        <img
                          src={stream.thumbnail || "/placeholder.svg?height=180&width=320&text=Live+Stream"}
                          alt={stream.title}
                          className="w-full h-48 object-cover"
                        />

                        {/* Live indicator */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>

                        {/* Viewer count */}
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <Users className="h-3 w-3 inline mr-1" />
                          {stream.viewerCount}
                        </div>

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-xl gap-2"
                            onClick={() => handleWatchStream(stream)}
                          >
                            <Play className="h-5 w-5" />
                            Watch Stream
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{stream.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{stream.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(stream.startTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{stream.roomCode}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

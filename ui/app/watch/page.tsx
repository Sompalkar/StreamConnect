"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Users, Eye, Search, Filter, Clock, Sparkles } from "lucide-react"
import { StreamHeader } from "@/components/stream-header"
import { motion } from "framer-motion"

interface LiveStream {
  id: string
  title: string
  description: string
  viewerCount: number
  thumbnail: string
  isLive: boolean
  createdAt: string
  roomCode: string
}

// Mock data for demonstration
const mockStreams: LiveStream[] = [
  {
    id: "1",
    title: "Tech Talk: Building Modern Web Apps",
    description: "Join us for an in-depth discussion about modern web development practices and tools.",
    roomCode: "ABC123",
    viewerCount: 234,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Tech+Talk",
    isLive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Creative Design Workshop",
    description: "Learn the latest design trends and techniques in this interactive workshop.",
    roomCode: "DEF456",
    viewerCount: 156,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Design+Workshop",
    isLive: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Gaming Session: Latest Releases",
    description: "Playing and reviewing the hottest new games with live commentary.",
    roomCode: "GHI789",
    viewerCount: 89,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Gaming+Session",
    isLive: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Cooking Masterclass",
    description: "Learn to cook delicious meals with professional chef techniques.",
    roomCode: "JKL101",
    viewerCount: 67,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Cooking+Class",
    isLive: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Music Production Live",
    description: "Creating beats and producing music live with audience interaction.",
    roomCode: "MNO202",
    viewerCount: 123,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Music+Production",
    isLive: true,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    title: "Fitness & Wellness Session",
    description: "Join our live workout session and wellness tips for a healthy lifestyle.",
    roomCode: "PQR303",
    viewerCount: 45,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Fitness+Session",
    isLive: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

export default function WatchPage() {
  const [streams, setStreams] = useState<LiveStream[]>(mockStreams)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Streams", count: streams.length },
    { id: "tech", name: "Technology", count: 2 },
    { id: "creative", name: "Creative", count: 2 },
    { id: "gaming", name: "Gaming", count: 1 },
    { id: "lifestyle", name: "Lifestyle", count: 2 },
  ]

  // Filter streams based on search and category
  const filteredStreams = streams.filter((stream) => {
    const matchesSearch =
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedCategory === "all") return matchesSearch

    // Simple category matching based on keywords
    const categoryKeywords = {
      tech: ["tech", "web", "development", "programming"],
      creative: ["design", "creative", "art", "music"],
      gaming: ["gaming", "game", "play"],
      lifestyle: ["cooking", "fitness", "wellness", "lifestyle"],
    }

    const keywords = categoryKeywords[selectedCategory as keyof typeof categoryKeywords] || []
    const matchesCategory = keywords.some(
      (keyword) => stream.title.toLowerCase().includes(keyword) || stream.description.toLowerCase().includes(keyword),
    )

    return matchesSearch && matchesCategory
  })

  // Fetch live streams from API
  useEffect(() => {
    const fetchLiveStreams = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:3001/api/rooms/live")
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Combine API streams with mock streams
            setStreams([...data.rooms, ...mockStreams])
          }
        }
      } catch (error) {
        console.error("Failed to fetch live streams:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLiveStreams()

    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleWatchStream = (roomCode: string) => {
    // Navigate to stream page to join as viewer
    window.open(`/stream?join=${roomCode}`, "_blank")
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
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Live Now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Discover Live Streams
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Watch amazing live content from creators around the world. Join conversations, learn new skills, and be
                entertained.
              </p>
            </motion.div>

            {/* Search and Filters */}
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
                    placeholder="Search live streams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-primary"
                  />
                </div>
                <Button variant="outline" size="lg" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "gradient-primary text-primary-foreground" : ""}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Streams Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading live streams...</p>
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No live streams found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "Be the first to go live!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                      <div className="relative">
                        <img
                          src={stream.thumbnail || "/placeholder.svg"}
                          alt={stream.title}
                          className="w-full h-48 object-cover"
                        />

                        {/* Live indicator */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>

                        {/* Viewer count */}
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {stream.viewerCount} viewers
                        </div>

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="lg"
                            className="gradient-primary text-primary-foreground shadow-glow"
                            onClick={() => handleWatchStream(stream.roomCode)}
                          >
                            <Play className="h-5 w-5 mr-2" />
                            Join Stream
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{stream.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{stream.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(stream.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {stream.viewerCount}
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

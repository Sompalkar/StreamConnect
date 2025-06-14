"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, LayoutGrid, Focus, Share2, Settings, Users } from "lucide-react"
import { useStreamStore } from "@/lib/store"
import { StreamControls } from "@/components/stream-controls"
import { StreamHeader } from "@/components/stream-header"
import { VideoGrid } from "@/components/video-grid"
import { useToast } from "@/components/ui/use-toast"
import { ChatPanel } from "@/components/chat-panel"
import { RoomSetup } from "@/components/room-setup"
import { LiveStreamControls } from "@/components/live-stream-controls"
import { RoomSettings } from "@/components/room-settings"
import { motion } from "framer-motion"

export default function StreamPage() {
  const { toast } = useToast()
  const {
    localStream,
    remoteStreams,
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    initializeStream,
    connectToRoom,
    disconnectFromRoom,
    isConnected,
    sendChatMessage,
    chatMessages,
    currentRoom,
    createRoom,
    joinRoom,
    goLive,
    endLive,
    isLive,
    isCreator,
  } = useStreamStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [layoutMode, setLayoutMode] = useState<"equal" | "focus">("equal")
  const [showRoomSetup, setShowRoomSetup] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Initialize the local stream when the component mounts
    const init = async () => {
      setIsLoading(true)
      try {
        await initializeStream()
        toast({
          title: "Camera and microphone initialized",
          description: "You can now create or join a room.",
        })
      } catch (error) {
        console.error("Failed to initialize stream:", error)
        toast({
          title: "Failed to access camera or microphone",
          description: "Please check your permissions and try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()

    // Clean up when the component unmounts
    return () => {
      disconnectFromRoom()
    }
  }, [])

  // Handle creating a new room
  const handleCreateRoom = async () => {
    setIsLoading(true)
    try {
      const room = await createRoom()
      setShowRoomSetup(false)
      toast({
        title: "Room created successfully!",
        description: `Room code: ${room.roomCode}. Share this with others to join.`,
      })
    } catch (error) {
      console.error("Failed to create room:", error)
      toast({
        title: "Failed to create room",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle joining an existing room
  const handleJoinRoom = async (roomCode: string) => {
    setIsLoading(true)
    try {
      await joinRoom(roomCode)
      setShowRoomSetup(false)
      toast({
        title: "Joined room successfully!",
        description: "You are now connected to the stream.",
      })
    } catch (error) {
      console.error("Failed to join room:", error)
      toast({
        title: "Failed to join room",
        description: "Please check the room code and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle leaving the room
  const handleLeaveRoom = () => {
    disconnectFromRoom()
    setShowRoomSetup(true)
    toast({
      title: "Left the room",
      description: "You have disconnected from the stream.",
    })
  }

  // Handle going live
  const handleGoLive = async (title: string, description: string) => {
    try {
      await goLive(title, description)
      toast({
        title: "You're now live!",
        description: "Your stream is being broadcast to viewers.",
      })
    } catch (error) {
      console.error("Failed to go live:", error)
      toast({
        title: "Failed to go live",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle ending live
  const handleEndLive = async () => {
    try {
      await endLive()
      toast({
        title: "Live stream ended",
        description: "Your stream is no longer being broadcast.",
      })
    } catch (error) {
      console.error("Failed to end live:", error)
      toast({
        title: "Failed to end live",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy room code to clipboard
  const copyRoomCode = () => {
    if (currentRoom?.roomCode) {
      navigator.clipboard.writeText(currentRoom.roomCode)
      toast({
        title: "Room code copied!",
        description: "Share this code with others to join the stream.",
      })
    }
  }

  // Copy watch code to clipboard
  const copyWatchCode = () => {
    if (currentRoom?.watchCode) {
      navigator.clipboard.writeText(currentRoom.watchCode)
      toast({
        title: "Watch code copied!",
        description: "Share this code with viewers to watch the stream.",
      })
    }
  }

  // Share room
  const handleShare = async () => {
    if (!currentRoom) return

    const shareData = {
      title: "Join my StreamConnect room",
      text: `Join my live stream! Room code: ${currentRoom.roomCode} | Watch code: ${currentRoom.watchCode}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `Join my live stream!\nRoom code: ${currentRoom.roomCode}\nWatch code: ${currentRoom.watchCode}\n${window.location.href}`,
        )
        toast({
          title: "Share info copied!",
          description: "Room and watch codes copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  // Toggle chat panel
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Switch layout mode
  const toggleLayout = () => {
    setLayoutMode(layoutMode === "equal" ? "focus" : "equal")
  }

  // Show room setup if not connected
  if (showRoomSetup || !currentRoom) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
        <StreamHeader />
        <main className="flex-1 flex items-center justify-center">
          <RoomSetup onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} isLoading={isLoading} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StreamHeader />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* Room info header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <Card className="p-4 bg-card shadow-card border-2 border-primary/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {currentRoom.title || `Room ${currentRoom.roomCode}`}
                      </h1>
                      {isLive && (
                        <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {remoteStreams.length + (localStream ? 1 : 0)} participants
                      </span>
                      {isCreator && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          Creator
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Live controls for creator */}
                  {isCreator && (
                    <LiveStreamControls
                      isLive={isLive}
                      onGoLive={handleGoLive}
                      onEndLive={handleEndLive}
                      isLoading={isLoading}
                    />
                  )}

                  {/* Room code */}
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium text-primary">Room: {currentRoom.roomCode}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyRoomCode}
                      className="h-6 w-6 p-0 hover:bg-primary/20"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Watch code */}
                  <div className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-lg border border-secondary/20">
                    <span className="text-sm font-medium text-secondary-foreground">
                      Watch: {currentRoom.watchCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyWatchCode}
                      className="h-6 w-6 p-0 hover:bg-secondary/20"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Layout toggle */}
                  <Button size="sm" variant="outline" onClick={toggleLayout} className="gap-2 hover:bg-muted">
                    {layoutMode === "equal" ? <Focus className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                    <span className="hidden sm:inline">{layoutMode === "equal" ? "Focus" : "Equal"}</span>
                  </Button>

                  {/* Settings */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="gap-2 hover:bg-muted"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>

                  {/* Share button */}
                  <Button size="sm" variant="outline" onClick={handleShare} className="gap-2 hover:bg-muted">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>

                  {/* Leave room */}
                  <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
                    Leave
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Video and chat container */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            {/* Video section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <Card className="flex-1 p-4 bg-card shadow-card min-h-0">
                <VideoGrid
                  localStream={localStream}
                  remoteStreams={remoteStreams}
                  isMicOn={isMicOn}
                  isCameraOn={isCameraOn}
                  layoutMode={layoutMode}
                />
              </Card>

              {/* Controls */}
              <div className="mt-4">
                <StreamControls
                  isMicOn={isMicOn}
                  isCameraOn={isCameraOn}
                  toggleMic={toggleMic}
                  toggleCamera={toggleCamera}
                  isConnected={isConnected}
                  isLoading={isLoading}
                  toggleChat={toggleChat}
                  isChatOpen={isChatOpen}
                />
              </div>
            </motion.div>

            {/* Chat panel - Show on large screens or when explicitly opened */}
            {isChatOpen && window.innerWidth >= 1024 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 flex-shrink-0">
                <ChatPanel messages={chatMessages} sendMessage={sendChatMessage} isConnected={isConnected} />
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Room Settings Modal */}
      {showSettings && (
        <RoomSettings
          room={currentRoom}
          isCreator={isCreator}
          onClose={() => setShowSettings(false)}
          onUpdateRoom={(title, description) => {
            // Handle room update
            setShowSettings(false)
          }}
        />
      )}

      {/* Mobile Chat Overlay */}
      {isChatOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-background border-l">
            <ChatPanel messages={chatMessages} sendMessage={sendChatMessage} isConnected={isConnected} />
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Focus, Share2, Settings, Users, MessageSquare } from "lucide-react"
import { useStreamStore } from "@/lib/store"
import { StreamControls } from "@/components/stream-controls"
import { StreamHeader } from "@/components/stream-header"
import { VideoGrid } from "@/components/video-grid"
import { useToast } from "@/components/ui/use-toast"
import { ChatPanel } from "@/components/chat-panel"
import { RoomSetup } from "@/components/room-setup"
import { LiveStreamControls } from "@/components/live-stream-controls"
import { RoomSettings } from "@/components/room-settings"
import { motion, AnimatePresence } from "framer-motion"

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
    stopStream,
  } = useStreamStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<"equal" | "focus">("equal")
  const [showRoomSetup, setShowRoomSetup] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const chatOverlayRef = useRef<HTMLDivElement>(null)

  // Handle outside click for chat overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOverlayRef.current && !chatOverlayRef.current.contains(event.target as Node)) {
        setIsChatOpen(false)
      }
    }

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isChatOpen])

  // Handle creating a new room
  const handleCreateRoom = async () => {
    setIsLoading(true)
    try {
      // Initialize stream first
      await initializeStream()

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
        description: "Please check your camera and microphone permissions.",
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
      // Initialize stream first
      await initializeStream()

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
        description: "Please check the room code and your camera/microphone permissions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle leaving the room
  const handleLeaveRoom = () => {
    disconnectFromRoom()
    stopStream()
    setShowRoomSetup(true)
    setIsChatOpen(false)
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

  // Share room
  const handleShare = async () => {
    if (!currentRoom) return

    const shareData = {
      title: "Join my StreamConnect room",
      text: `Join my live stream! Room code: ${currentRoom.roomCode}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `Join my live stream!\nRoom code: ${currentRoom.roomCode}\n${window.location.href}`,
        )
        toast({
          title: "Share info copied!",
          description: "Room code copied to clipboard.",
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

  const totalParticipants = remoteStreams.length + (localStream ? 1 : 0)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <StreamHeader />

      {/* Main content - Google Meet style layout */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Top bar with room info and controls */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{currentRoom.title || `Room ${currentRoom.roomCode}`}</h1>
                    {isLive && (
                      <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    )}
                    {isCreator && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
                    </span>
                    <span>Room: {currentRoom.roomCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Live controls for creator */}
                {isCreator && (
                  <LiveStreamControls
                    isLive={isLive}
                    onGoLive={handleGoLive}
                    onEndLive={handleEndLive}
                    isLoading={isLoading}
                  />
                )}

                {/* Layout toggle - only show if multiple participants */}
                {totalParticipants > 1 && (
                  <Button size="sm" variant="outline" onClick={toggleLayout} className="gap-2">
                    {layoutMode === "equal" ? <Focus className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                    <span className="hidden sm:inline">{layoutMode === "equal" ? "Focus" : "Grid"}</span>
                  </Button>
                )}

                {/* Chat toggle */}
                <Button
                  size="sm"
                  variant={isChatOpen ? "default" : "outline"}
                  onClick={toggleChat}
                  className="gap-2 relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                  {chatMessages.length > 0 && !isChatOpen && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </Button>

                {/* Settings */}
                <Button size="sm" variant="outline" onClick={() => setShowSettings(true)} className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>

                {/* Share */}
                <Button size="sm" variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                {/* Leave */}
                <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
                  Leave
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video area - Google Meet style */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Main video area */}
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <div className="flex-1 min-h-0">
              <VideoGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                layoutMode={layoutMode}
              />
            </div>

            {/* Bottom controls */}
            <div className="flex-shrink-0 pt-4">
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
          </div>

          {/* Desktop chat sidebar */}
          <AnimatePresence>
            {isChatOpen && (
              <>
                {/* Desktop sidebar */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:flex flex-col border-l bg-card overflow-hidden"
                >
                  <ChatPanel
                    messages={chatMessages}
                    sendMessage={sendChatMessage}
                    isConnected={isConnected}
                    onClose={() => setIsChatOpen(false)}
                  />
                </motion.div>

                {/* Mobile/tablet overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden fixed inset-0 bg-black/50 z-50"
                >
                  <motion.div
                    ref={chatOverlayRef}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 0.3, type: "spring", damping: 25 }}
                    className="absolute right-0 top-0 h-full w-full max-w-sm bg-background border-l shadow-xl"
                  >
                    <ChatPanel
                      messages={chatMessages}
                      sendMessage={sendChatMessage}
                      isConnected={isConnected}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Room Settings Modal */}
      {showSettings && (
        <RoomSettings
          room={currentRoom}
          isCreator={isCreator}
          onClose={() => setShowSettings(false)}
          onUpdateRoom={(title, description) => {
            setShowSettings(false)
          }}
        />
      )}
    </div>
  )
}

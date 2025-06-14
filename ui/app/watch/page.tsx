"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, LayoutGrid, Focus, Share2 } from "lucide-react"
import { useStreamStore } from "@/lib/store"
import { StreamControls } from "@/components/stream-controls"
import { StreamHeader } from "@/components/stream-header"
import { VideoGrid } from "@/components/video-grid"
import { useToast } from "@/components/ui/use-toast"
import { ChatPanel } from "@/components/chat-panel"
import { RoomSetup } from "@/components/room-setup"
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
  } = useStreamStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [layoutMode, setLayoutMode] = useState<"equal" | "focus">("equal")
  const [showRoomSetup, setShowRoomSetup] = useState(true)

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

      {/* Main content - Fixed height to prevent scrolling */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* Room info header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <Card className="p-4 bg-card shadow-card border-2 border-primary/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Live Stream Room
                  </h1>
                  <p className="text-muted-foreground">
                    {remoteStreams.length + (localStream ? 1 : 0)} participants connected
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                    {layoutMode === "equal" ? "Focus" : "Equal"}
                  </Button>

                  {/* Share button */}
                  <Button size="sm" variant="outline" onClick={handleShare} className="gap-2 hover:bg-muted">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>

                  {/* Leave room */}
                  <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
                    Leave Room
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Video and chat container - Flexible height */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Video section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${isChatOpen ? "flex-1" : "w-full"} flex flex-col min-h-0`}
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

            {/* Chat panel - Fixed width */}
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 flex-shrink-0">
                <ChatPanel messages={chatMessages} sendMessage={sendChatMessage} isConnected={isConnected} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

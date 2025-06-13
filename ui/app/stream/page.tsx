"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useStreamStore } from "@/lib/store"
import { StreamControls } from "@/components/stream-controls"
import { StreamHeader } from "@/components/stream-header"
import { VideoGrid } from "@/components/video-grid"
import { useToast } from "@/components/ui/use-toast"
import { ChatPanel } from "@/components/chat-panel"

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
  } = useStreamStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)

  useEffect(() => {
    // Initialize the local stream when the component mounts
    const init = async () => {
      setIsLoading(true)
      try {
        await initializeStream()
        toast({
          title: "Camera and microphone initialized",
          description: "You can now join the stream.",
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

  const handleJoinRoom = async () => {
    setIsLoading(true)
    try {
      await connectToRoom("main-room")
      toast({
        title: "Connected to stream",
        description: "You are now streaming with others.",
      })
    } catch (error) {
      console.error("Failed to connect to room:", error)
      toast({
        title: "Connection failed",
        description: "Could not connect to the streaming room.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveRoom = () => {
    disconnectFromRoom()
    toast({
      title: "Disconnected from stream",
      description: "You have left the streaming room.",
    })
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StreamHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`flex-1 ${isChatOpen ? "lg:w-3/4" : "w-full"}`}>
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Live Stream</h1>
                  <p className="text-muted-foreground">
                    Connect with others using WebRTC for real-time video interaction
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <Users className="h-4 w-4" />
                    <span>{remoteStreams.length + (localStream ? 1 : 0)} participants</span>
                  </div>
                  {isConnected ? (
                    <Button variant="destructive" onClick={handleLeaveRoom} disabled={isLoading}>
                      Leave Stream
                    </Button>
                  ) : (
                    <Button onClick={handleJoinRoom} disabled={isLoading || !localStream}>
                      Join Stream
                    </Button>
                  )}
                </div>
              </div>

              <VideoGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
              />
            </Card>

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

          {isChatOpen && (
            <div className="lg:w-1/4">
              <ChatPanel messages={chatMessages} sendMessage={sendChatMessage} isConnected={isConnected} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

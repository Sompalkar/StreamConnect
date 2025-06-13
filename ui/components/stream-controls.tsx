"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, Share2, MessageSquare } from "lucide-react"

interface StreamControlsProps {
  isMicOn: boolean
  isCameraOn: boolean
  toggleMic: () => void
  toggleCamera: () => void
  isConnected: boolean
  isLoading: boolean
  toggleChat: () => void
  isChatOpen: boolean
}

export function StreamControls({
  isMicOn,
  isCameraOn,
  toggleMic,
  toggleCamera,
  isConnected,
  isLoading,
  toggleChat,
  isChatOpen,
}: StreamControlsProps) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: "StreamConnect",
        text: "Join me on StreamConnect!",
        url: window.location.href,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant={isMicOn ? "default" : "outline"}
          size="lg"
          className="gap-2"
          onClick={toggleMic}
          disabled={isLoading || !isConnected}
        >
          {isMicOn ? (
            <>
              <Mic className="h-5 w-5" /> Microphone On
            </>
          ) : (
            <>
              <MicOff className="h-5 w-5" /> Microphone Off
            </>
          )}
        </Button>

        <Button
          variant={isCameraOn ? "default" : "outline"}
          size="lg"
          className="gap-2"
          onClick={toggleCamera}
          disabled={isLoading || !isConnected}
        >
          {isCameraOn ? (
            <>
              <Video className="h-5 w-5" /> Camera On
            </>
          ) : (
            <>
              <VideoOff className="h-5 w-5" /> Camera Off
            </>
          )}
        </Button>

        <Button variant={isChatOpen ? "default" : "outline"} size="lg" className="gap-2" onClick={toggleChat}>
          <MessageSquare className="h-5 w-5" /> {isChatOpen ? "Hide Chat" : "Show Chat"}
        </Button>

        <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
          <Share2 className="h-5 w-5" /> Share Stream
        </Button>
      </div>
    </Card>
  )
}

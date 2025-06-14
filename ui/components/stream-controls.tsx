"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, MessageSquare } from "lucide-react"

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
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border rounded-full px-6 py-3 shadow-lg">
        <Button
          variant={isMicOn ? "default" : "destructive"}
          size="lg"
          className={`rounded-full w-12 h-12 p-0 ${
            isMicOn ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={toggleMic}
          disabled={isLoading || !isConnected}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isCameraOn ? "default" : "destructive"}
          size="lg"
          className={`rounded-full w-12 h-12 p-0 ${
            isCameraOn ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={toggleCamera}
          disabled={isLoading || !isConnected}
        >
          {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isChatOpen ? "default" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0 lg:hidden"
          onClick={toggleChat}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
